import { hashTrackingToken } from '@/lib/order-security';

// Guest order tracking policy, kept free of request/response plumbing so it can be
// unit tested against a fake query builder.
//
// Threat model: `order_number` is a semi-public reference (it appears on invoices
// and in support threads). Tracking an order therefore requires a second factor —
// the `tracking_token` issued at checkout, of which only the SHA-256 digest is
// stored. Two properties matter:
//
//   1. No enumeration oracle. A wrong token, a missing token and a nonexistent
//      order must be indistinguishable to the caller, so all three take the same
//      code path and return the same body and status.
//   2. Single query. The digest goes into the WHERE clause, so a mismatch is
//      decided by Postgres rather than by a second round-trip that would leak
//      existence through timing or error differences.

export const TRACKING_NOT_FOUND_MESSAGE = 'Order not found.';

export type TrackingQuery = {
  select: (columns: string) => TrackingQuery;
  eq: (column: string, value: string) => TrackingQuery;
  maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
};

export type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  email: string;
  phone: string | null;
  address: unknown;
  items: unknown;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping: number | string;
  discount: number | string;
  subtotal: number | string;
  total: number | string;
  notes: string | null;
  user_id: string | null;
  tracking_token: string | null;
  created_at: string;
  updated_at?: string;
};

/**
 * The only columns the tracking endpoint ever reads.
 * Deliberately excludes `email`, `phone`, `address`, `notes`, `user_id` and
 * `tracking_token` — the tracking UI needs none of them, and fetching columns you
 * will not return is how PII ends up in an error log or a debug overlay.
 */
export const TRACKING_SELECT = 'id, order_number, status, payment_status, shipping, discount, subtotal, total, items, created_at';

/** Columns the owner's own view is allowed to add back (still no raw contact PII). */
const OWNER_SELECT = `${TRACKING_SELECT}, customer_name`;

export type TrackingLookup =
  | { found: true; order: OrderRow; via: 'token' | 'owner' }
  | { found: false; reason: 'missing_reference' | 'not_found' };

export type LookupInput = {
  orderNumber: string | null;
  token: string | null;
  userId: string | null;
  client: TrackingQuery;
};

/**
 * Resolves an order for tracking. Returns a discriminated result; the caller turns
 * `missing_reference` into a 400 usage error and `not_found` into the single generic
 * 404 body.
 */
export async function lookupOrderForTracking(input: LookupInput): Promise<TrackingLookup> {
  const { orderNumber, token, userId, client } = input;

  if (!orderNumber) return { found: false, reason: 'missing_reference' };

  // Primary path: order number + token digest. Rejects the vast majority of probes
  // in the database itself.
  if (token) {
    const digest = hashTrackingToken(token);
    const byToken = await client
      .select(OWNER_SELECT)
      .eq('order_number', orderNumber)
      .eq('tracking_token', digest)
      .maybeSingle();

    if (!byToken.error && byToken.data) {
      return { found: true, order: byToken.data as OrderRow, via: 'token' };
    }
    // A malformed digest can't match anything; a genuine mismatch falls through to
    // the owner check and then reports the same generic miss.
  }

  // Fallback: an authenticated user may view their own order without the token, so
  // the post-checkout page still works for signed-in customers. Scoped by user_id,
  // so this cannot widen access to anyone else's order.
  if (userId) {
    const byOwner = await client
      .select(OWNER_SELECT)
      .eq('order_number', orderNumber)
      .eq('user_id', userId)
      .maybeSingle();

    if (!byOwner.error && byOwner.data) {
      return { found: true, order: byOwner.data as OrderRow, via: 'owner' };
    }
  }

  return { found: false, reason: 'not_found' };
}

export type TrackingItem = { name: string; size: string; quantity: number; price: number };
export type TrackingView = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  items: TrackingItem[];
  customerName?: string;
};

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function coerceItems(raw: unknown): TrackingItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 50).map((entry) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    return {
      name: String(item.name ?? '').slice(0, 200),
      size: String(item.size ?? '').slice(0, 20),
      quantity: Math.max(0, Math.trunc(num(item.quantity))),
      price: num(item.price),
    };
  });
}

/**
 * Projects a stored order onto exactly what the tracking UI renders.
 *
 * This is a whitelist, not a blacklist: `email`, `phone`, `address`, `notes`,
 * `user_id` and `tracking_token` have no path into the response even if the row
 * gains new columns later.
 */
export function toTrackingView(order: OrderRow, options: { includeCustomerName?: boolean } = {}): TrackingView {
  const view: TrackingView = {
    orderNumber: order.order_number,
    status: order.status,
    paymentStatus: order.payment_status,
    createdAt: order.created_at,
    subtotal: num(order.subtotal),
    shipping: num(order.shipping),
    discount: num(order.discount),
    total: num(order.total),
    items: coerceItems(order.items),
  };
  if (options.includeCustomerName) {
    view.customerName = String(order.customer_name ?? '').slice(0, 120);
  }
  return view;
}

/** Columns a checkout-created order may echo back to its own creator. */
export const ORDER_ACK_SELECT = 'id, order_number, total, status, created_at';