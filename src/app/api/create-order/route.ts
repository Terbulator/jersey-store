import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';
import { getSession } from '@/lib/session';
import { logAudit } from '@/lib/audit';
import { applyCoupon } from '@/lib/coupon';
import { stripe } from '@/lib/stripe';
import { assertSameOrigin } from '@/lib/csrf';
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
  couponCode: z.string().max(50).optional(),
  referralCode: z.string().max(50).optional(),
  paymentIntentId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const csrf = assertSameOrigin(req);
    if (csrf) return csrf;

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

    const { items, couponCode, referralCode, paymentIntentId } = parsed.data;

    // Verify Stripe payment if a PaymentIntent was provided
    let paymentStatus: 'PAID' | 'PENDING' = 'PENDING';
    if (paymentIntentId && stripe) {
      try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (pi.status === 'succeeded' && pi.metadata?.userId === user.id) {
          paymentStatus = 'PAID';
        }
      } catch {
        return NextResponse.json({ error: 'Invalid payment intent' }, { status: 400 });
      }
    }

    // Compute the order atomically — price, stock check + decrement, and totals
    // are all server-side so the client can never under-pay or oversell.
    const order = await prisma.$transaction(async (tx) => {
      let validatedSubtotal = 0;
      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { price: true, stock: true },
        });
        if (!variant) {
          throw new OrderError(`Invalid variant: ${item.variantId}`);
        }
        if (variant.stock < item.quantity) {
          throw new OrderError(`Insufficient stock for variant ${item.variantId}`);
        }
        validatedSubtotal += Number(variant.price) * item.quantity;
      }

      const shipping = validatedSubtotal > 1000 ? 0 : 99;
      const tax = validatedSubtotal * 0.05;

      const coupon = await applyCoupon(couponCode, validatedSubtotal, tx);
      const discount = coupon ? coupon.discount : 0;

      let couponId: string | null = null;
      if (coupon) {
        const found = await tx.coupon.findUnique({ where: { code: coupon.code }, select: { id: true } });
        couponId = found?.id ?? null;
      }

      let resellerId: string | null = null;
      let resellerCommissionRate = 0;
      if (referralCode && referralCode.trim()) {
        const reseller = await tx.reseller.findUnique({
          where: { referralCode: referralCode.trim().toUpperCase() },
          select: { id: true, status: true, commissionRate: true },
        });
        if (reseller && reseller.status === 'APPROVED') {
          resellerId = reseller.id;
          resellerCommissionRate = reseller.commissionRate;
        }
      }

      const created = await tx.order.create({
        data: {
          userId: user.id,
          orderNumber: generateOrderNumber(),
          status: 'PROCESSING',
          paymentStatus,
          couponId,
          resellerId,
          discount,
          subtotal: validatedSubtotal,
          shipping,
          tax,
          total: validatedSubtotal + shipping + tax - discount,
        },
      });

      if (coupon) {
        await tx.coupon.update({
          where: { code: coupon.code },
          data: { usedCount: { increment: 1 } },
        });
      }

      if (resellerId) {
        const commissionEarned = Math.round(validatedSubtotal * resellerCommissionRate * 100) / 100;
        await tx.resellerSale.create({ data: { resellerId, orderId: created.id, commissionEarned } });
      }

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { vendorId: true },
        });
        if (!product) throw new Error(`Product not found: ${item.productId}`);

        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { price: true },
        });

        await tx.orderItem.create({
          data: {
            orderId: created.id,
            productId: item.productId,
            variantId: item.variantId,
            vendorId: product.vendorId,
            quantity: item.quantity,
            price: variant?.price ?? item.price,
            total: Number(variant?.price ?? item.price) * item.quantity,
          },
        });

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

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
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}

class OrderError extends Error {}
