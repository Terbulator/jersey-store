import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';
import { getSession } from '@/lib/session';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const itemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  name: z.string(),
  price: z.number().nonnegative(),
  quantity: z.number().int().min(1).max(100),
});

const orderSchema = z.object({
  items: z.array(itemSchema).min(1),
  shipping: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid order' },
        { status: 400 }
      );
    }

    const { items, shipping, tax } = parsed.data;

    // Validate prices server-side — trust DB, not client
    let validatedSubtotal = 0;
    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: { price: true, stock: true },
      });
      if (!variant) {
        return NextResponse.json({ error: `Invalid variant: ${item.variantId}` }, { status: 400 });
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for variant ${item.variantId}` }, { status: 400 });
      }
      validatedSubtotal += Number(variant.price) * item.quantity;
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber: generateOrderNumber(),
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        subtotal: validatedSubtotal,
        shipping: shipping ?? 0,
        tax: tax ?? 0,
        total: validatedSubtotal + (shipping ?? 0) + (tax ?? 0),
      },
    });

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { vendorId: true },
      });
      if (!product) throw new Error(`Product not found: ${item.productId}`);

      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: { price: true },
      });

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId,
          vendorId: product.vendorId,
          quantity: item.quantity,
          price: variant?.price ?? item.price,
          total: Number(variant?.price ?? item.price) * item.quantity,
        },
      });

      // Decrement stock
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'order.create',
      resource: 'order',
      resourceId: order.id,
      newValues: { orderNumber: order.orderNumber, total: order.total },
    });

    return NextResponse.json({ ok: true, orderNumber: order.orderNumber }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
