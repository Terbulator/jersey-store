import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const checkoutSchema = z.object({
  amount: z.number().positive().max(10_000_000),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        name: z.string().optional(),
        quantity: z.number().int().min(1).max(100).optional(),
      })
    )
    .max(100)
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
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

    const { amount, items } = parsed.data;

    const metadata: Record<string, string> = {};
    if (Array.isArray(items)) {
      items.forEach((item: { productId?: string; name?: string; quantity?: number }, i: number) => {
        metadata[`item_${i}`] = `${item.name ?? 'jersey'} x${item.quantity ?? 1}`;
        if (item.productId) metadata[`productId_${i}`] = String(item.productId);
      });
    }
    metadata.userId = user.id;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
      metadata,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
