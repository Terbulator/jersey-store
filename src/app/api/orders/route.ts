import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDataClient } from '@/lib/admin';
import { isRateLimited } from '@/lib/rate-limit';

const itemSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1).max(20),
  quantity: z.number().int().min(1).max(20),
});

const orderSchema = z.object({
  items: z.array(itemSchema).min(1).max(50),
  customerName: z.string().min(1).max(120),
  email: z.string().email().max(254),
  phone: z.string().min(6).max(20).optional().or(z.literal('')),
  address: z.object({
    line1: z.string().min(1).max(300),
    line2: z.string().optional(),
    city: z.string().min(1).max(120),
    state: z.string().min(1).max(120),
    pincode: z.string().min(3).max(20),
  }),
  notes: z.string().max(1000).optional(),
  paymentMethod: z.enum(['COD']).default('COD'),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(`orders:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests, please slow down.' }, { status: 429 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing or invalid checkout details.', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = parsed.data;

  const sb = await adminDataClient();

  // Recompute prices server-side from the DB catalog. Never trust client totals.
  const productIds = [...new Set(payload.items.map((i) => i.productId))];
  const { data: dbProducts, error: lookupError } = await sb
    .from('products')
    .select('id, name, slug, images, price')
    .in('id', productIds);

  if (lookupError) {
    return NextResponse.json({ error: 'Could not verify the catalog.' }, { status: 500 });
  }
  const byId = new Map((dbProducts ?? []).map((p) => [p.id, p]));

  const resolvedItems = payload.items.map((item) => {
    const product = byId.get(item.productId);
    if (!product) return null;
    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] ?? '',
      size: item.size,
      quantity: item.quantity,
      price: Number(product.price),
    };
  });

  if (resolvedItems.some((i) => i === null)) {
    return NextResponse.json({ error: 'One or more products were not found.' }, { status: 400 });
  }
  const items = resolvedItems as NonNullable<(typeof resolvedItems)[number]>[];
  const { data: settings } = await sb.from('site_settings').select('value').eq('key', 'shipping').maybeSingle();
  const shippingCfg = (settings?.value ?? {}) as { freeThreshold?: number; standardRate?: number };
  const FREE_SHIPPING_THRESHOLD = Number(shippingCfg.freeThreshold ?? 999);
  const STANDARD_SHIPPING = Number(shippingCfg.standardRate ?? 99);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const total = subtotal + shipping;

  const orderNumber = `HDR-${Date.now().toString().slice(-8)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { data, error } = await sb
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_name: payload.customerName,
      email: payload.email,
      phone: payload.phone || null,
      address: payload.address,
      items,
      payment_method: payload.paymentMethod,
      payment_status: 'PENDING',
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      discount: 0,
      total: Math.round(total * 100) / 100,
      notes: payload.notes || null,
    })
    .select('id, order_number, total')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Could not save the order.' }, { status: 500 });
  }

  return NextResponse.json({ order: data }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get('order');
  if (!orderNumber) {
    return NextResponse.json({ error: 'Order number required.' }, { status: 400 });
  }

  const sb = await adminDataClient();
  const { data: order, error } = await sb
    .from('orders')
    .select('id, order_number, total, subtotal, shipping, discount, customer_name, email, status, payment_status, created_at, items')
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  return NextResponse.json({ order });
}
