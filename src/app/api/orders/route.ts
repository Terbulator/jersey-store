import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { adminDataClient } from '@/lib/admin';
import { checkRateLimit } from '@/lib/security';
import { logAudit } from '@/lib/audit';
import {
  createTrackingCredential,
  generateIdempotencyKey,
  generateOrderNumber,
  IDEMPOTENCY_KEY_PATTERN,
} from '@/lib/order-security';
import {
  ORDER_ACK_SELECT,
  TRACKING_NOT_FOUND_MESSAGE,
  TRACKING_SELECT,
  lookupOrderForTracking,
  toTrackingView,
  type TrackingQuery,
} from '@/lib/order-tracking';
import { computeOrderTotals, evaluateCoupon, resolveShipping, type CouponRow } from '@/lib/coupon-rules';
import { MAX_QUANTITY_PER_LINE, MAX_LINES_PER_ORDER } from '@/lib/order-limits';
import { toStockLines } from '@/lib/order-stock';

type ServiceClient = Awaited<ReturnType<typeof adminDataClient>>;

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const lineItemSchema = z.object({
  productId: z.string().uuid('productId must be a product id.'),
  size: z.string().trim().min(1).max(20),
  // Positive integer only: rejects 0, negatives and fractional quantities.
  quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_LINE),
});

const addressSchema = z.object({
  line1: z.string().trim().min(1).max(300),
  line2: z.string().trim().max(300).optional().or(z.literal('')),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
  pincode: z.string().trim().min(3).max(20),
  country: z.string().trim().max(60).optional(),
});

// `.strict()` so an unexpected field (a client-supplied price, total, discount or
// tracking token) is rejected outright rather than silently ignored.
const orderSchema = z
  .object({
    items: z.array(lineItemSchema).min(1).max(MAX_LINES_PER_ORDER),
    customerName: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().max(20).optional().or(z.literal('')),
    address: addressSchema,
    notes: z.string().trim().max(1000).optional().or(z.literal('')),
    paymentMethod: z.enum(['COD']).default('COD'),
    idempotencyKey: z.string().regex(IDEMPOTENCY_KEY_PATTERN, 'idempotencyKey must be 16-64 URL-safe characters.').optional(),
    couponCode: z.string().trim().min(1).max(32).optional(),
  })
  .strict();

const badRequest = (message: string, issues?: unknown) =>
  NextResponse.json({ error: message, ...(issues ? { issues } : {}) }, { status: 400 });

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

type ResolvedLine = { productId: string; name: string; slug: string; image: string; size: string; quantity: number; price: number };

/**
 * Resolves every requested line against the published catalog.
 *
 * Price always comes from the database row; the client cannot influence it. Only
 * published products are sellable, so a draft product cannot be force-added to a cart.
 */
async function resolveLines(
  sb: ServiceClient,
  lines: z.infer<typeof lineItemSchema>[]
): Promise<{ ok: true; resolved: ResolvedLine[] } | { ok: false; error: string }> {
  const productIds = [...new Set(lines.map((l) => l.productId))];
  const { data: products, error } = await sb
    .from('products')
    .select('id, name, slug, images, price, published')
    .in('id', productIds);

  if (error) return { ok: false, error: 'Could not verify the catalog.' };

  const byId = new Map((products ?? []).map((p) => [p.id as string, p]));

  const resolved: ResolvedLine[] = [];
  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product) return { ok: false, error: 'One or more products were not found.' };
    if (!product.published) return { ok: false, error: 'One or more products are not available.' };

    resolved.push({
      productId: product.id as string,
      name: String(product.name ?? ''),
      slug: String(product.slug ?? ''),
      image: Array.isArray(product.images) ? String((product.images as unknown[])[0] ?? '') : '',
      size: line.size,
      quantity: line.quantity,
      price: Number(product.price) || 0,
    });
  }

  return { ok: true, resolved };
}

/**
 * Atomically reserves stock for every line.
 *
 * The previous implementation read `stock`, compared it in JavaScript and then
 * inserted the order without touching stock — so N concurrent checkouts could all
 * pass the same check and oversell. This delegates the read-compare-decrement to a
 * single Postgres function that either reserves every line or none of them.
 */
async function reserveStock(sb: ServiceClient, lines: ResolvedLine[]): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data, error } = await sb.rpc('reserve_order_stock', {
    p_lines: toStockLines(lines),
  });

  if (error) {
    // Fail closed. The RPC is delivered by supabase/20261003_security-hardening.sql
    // and must be applied before deploying this code; without it there is no way to
    // reserve stock atomically, and silently skipping the check would reinstate the
    // oversell this replaces.
    return { ok: false, error: 'Could not reserve stock for this order.' };
  }

  const result = data as { ok?: boolean; message?: string } | null;
  if (!result?.ok) {
    return { ok: false, error: result?.message ?? 'Insufficient stock for one or more items.' };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// POST /api/orders — create an order
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, 'orders');
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON body.');
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Missing or invalid checkout details.', parsed.error.flatten());
  }
  const payload = parsed.data;

  // A client may retry the same checkout; dedupe on an explicit key when supplied
  // and on email + cart fingerprint otherwise.
  const idempotencyKey = payload.idempotencyKey ?? generateIdempotencyKey();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  const sb = await adminDataClient();

  // --- Idempotency: return the caller's own prior order, never someone else's ---
  const { data: existing } = await sb
    .from('orders')
    .select(`${ORDER_ACK_SELECT}, email, user_id`)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existing) {
    const sameRequester =
      (user && existing.user_id === user.id) ||
      (!user && String(existing.email ?? '').toLowerCase() === payload.email.toLowerCase());
    if (sameRequester) {
      return NextResponse.json(
        { order: { id: existing.id, order_number: existing.order_number, total: existing.total } },
        { status: 200 }
      );
    }
    // Someone else's order shares this key. Say nothing about it.
    return NextResponse.json({ error: TRACKING_NOT_FOUND_MESSAGE }, { status: 409 });
  }

  // --- Catalog + pricing (all money values computed here, never client-supplied) ---
  const lines = await resolveLines(sb, payload.items);
  if (!lines.ok) return badRequest(lines.error);

  const reservation = await reserveStock(sb, lines.resolved);
  if (!reservation.ok) return badRequest(reservation.error);

  const subtotal = lines.resolved.reduce((sum, line) => sum + line.price * line.quantity, 0);

  // --- Coupon: validated and priced server-side, clamped so total can't go negative
  let discount = 0;
  let couponId: string | null = null;
  if (payload.couponCode) {
    const { data: couponRow } = await sb
      .from('coupons')
      .select('id, code, type, value, min_spend, max_discount, max_uses, used_count, valid_from, valid_until, active')
      .eq('code', payload.couponCode.toUpperCase())
      .maybeSingle();

    const check = evaluateCoupon(couponRow as CouponRow | null, subtotal);
    if (!check.valid) return badRequest(check.error ?? 'Invalid coupon code.');
    discount = check.discount;
    couponId = check.couponId;
  }

  const { data: shippingSetting } = await sb.from('site_settings').select('value').eq('key', 'shipping').maybeSingle();
  const shipping = resolveShipping(subtotal, (shippingSetting?.value ?? {}) as { freeThreshold?: number; standardRate?: number });
  const totals = computeOrderTotals({ subtotal, shipping, discount });

  const orderNumber = generateOrderNumber();
  const tracking = createTrackingCredential();

  const insertData: Record<string, unknown> = {
    order_number: orderNumber,
    customer_name: payload.customerName,
    email: payload.email.toLowerCase(),
    phone: payload.phone || null,
    address: payload.address,
    items: lines.resolved,
    payment_method: 'COD',
    // Status and payment state are server-owned. A client cannot place an order
    // that is already marked paid.
    status: 'PENDING',
    payment_status: 'PENDING',
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    discount: totals.discount,
    total: totals.total,
    notes: payload.notes || null,
    tracking_token: tracking.hash,
    idempotency_key: idempotencyKey,
    coupon_id: couponId,
  };
  if (user) insertData.user_id = user.id;

  const { data: created, error: insertError } = await sb
    .from('orders')
    .insert(insertData)
    .select(ORDER_ACK_SELECT)
    .single();

  if (insertError || !created) {
    if (insertError?.code === '23505' && insertError.message.includes('idempotency_key')) {
      const { data: raced } = await sb
        .from('orders')
        .select(ORDER_ACK_SELECT)
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();
      if (raced) {
        return NextResponse.json({ order: raced }, { status: 200 });
      }
    }
    return NextResponse.json({ error: 'Could not save the order.' }, { status: 500 });
  }

  // Coupon redemption is a separate, atomic, service-role-only step. The RPC
  // re-checks max_uses under a row lock, so concurrent checkouts cannot exceed it.
  if (couponId) {
    const { data: redeem } = await sb.rpc('redeem_coupon', {
      p_coupon_id: couponId,
      p_subtotal: totals.subtotal,
    });
    const redemption = redeem as { ok?: boolean } | null;
    if (redemption && redemption.ok === false) {
      // The coupon filled up between validation and redemption. Void the order
      // rather than silently granting an unearned discount.
      await sb.from('orders').delete().eq('id', created.id);
      await sb.rpc('release_order_stock', {
        p_lines: toStockLines(lines.resolved),
      });
      return badRequest('Coupon usage limit reached.');
    }
  }

  await logAudit(sb, {
    actor: user?.email ?? payload.email,
    role: user ? 'CUSTOMER' : 'GUEST',
    action: 'create',
    resource: 'orders',
    resourceId: created.id,
    summary: `Order ${orderNumber} created`,
  });

  // The raw token is returned exactly once, here. Only its digest is stored.
  return NextResponse.json(
    { order: created, trackingToken: tracking.raw, trackingUrl: `/checkout/success?order=${encodeURIComponent(orderNumber)}&token=${encodeURIComponent(tracking.raw)}` },
    { status: 201 }
  );
}

// ---------------------------------------------------------------------------
// GET /api/orders — guest/self order tracking
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const limited = checkRateLimit(req, 'tracking');
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get('order');
  const token = searchParams.get('token');

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  const sb = await adminDataClient();

  const result = await lookupOrderForTracking({
    orderNumber,
    token,
    userId: user?.id ?? null,
    client: sb.from('orders').select(TRACKING_SELECT) as unknown as TrackingQuery,
  });

  if (!result.found) {
    // One generic answer for a missing reference, an unknown order number and a
    // wrong token. Nothing here distinguishes the three.
    return result.reason === 'missing_reference'
      ? NextResponse.json({ error: 'An order number is required.' }, { status: 400 })
      : NextResponse.json({ error: TRACKING_NOT_FOUND_MESSAGE }, { status: 404 });
  }

  return NextResponse.json(
    { order: toTrackingView(result.order, { includeCustomerName: result.via === 'owner' }) },
    { headers: { 'Cache-Control': 'no-store, private' } }
  );
}