import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { assertSameOrigin } from '@/lib/csrf';
import { z } from 'zod';

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().min(1).max(100),
      })
    )
    .min(1)
    .max(100),
  couponCode: z.string().max(50).optional(),
  referralCode: z.string().max(50).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const csrf = assertSameOrigin(req);
    if (csrf) return csrf;

    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Add your STRIPE_SECRET_KEY.', demo: true },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      );
    }

    const { items } = parsed.data;

    let totalAmount = 0;
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
      totalAmount += Number(variant.price) * item.quantity;
    }

    const shipping = totalAmount > 1000 ? 0 : 99;
    const tax = totalAmount * 0.05;
    const finalAmount = totalAmount + shipping + tax;

    const metadata: Record<string, string> = {};
    metadata.userId = user.id;
    items.forEach((item, i) => {
      metadata[`variant_${i}`] = item.variantId;
      metadata[`qty_${i}`] = String(item.quantity);
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100),
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
      metadata,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
