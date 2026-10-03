// Canonical mapping from an order's stored line items to the JSON shape the
// `reserve_order_stock` / `release_order_stock` Postgres functions expect.
//
// This exists as a single shared helper because the two RPCs read snake_case
// (`product_id`) while order line items are stored in camelCase (`productId`).
// When the admin cancel/refund path passed the raw stored `items` straight to
// `release_order_stock`, every lookup keyed on `product_id` resolved to NULL,
// matched no variant row, and silently released zero stock. Deriving both call
// sites from one function makes that drift impossible to reintroduce.
//
// Unusable entries are dropped rather than passed through: the RPC rejects a line
// with a null product id, and a malformed legacy row must not block a release.

export interface OrderLineLike {
  productId?: unknown;
  product_id?: unknown;
  size?: unknown;
  quantity?: unknown;
}

export interface StockLine {
  product_id: string;
  size: string;
  quantity: number;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Normalises any order line source into the `{ product_id, size, quantity }`
 * shape the stock RPCs consume. Accepts both `productId` and `product_id` so it
 * works against freshly resolved lines and already-persisted `items` jsonb.
 */
export function toStockLines(items: unknown): StockLine[] {
  if (!Array.isArray(items)) return [];

  const lines: StockLine[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as OrderLineLike;

    const productId = typeof item.productId === 'string' ? item.productId : item.product_id;
    if (typeof productId !== 'string' || !UUID.test(productId)) continue;

    const size = typeof item.size === 'string' ? item.size : null;
    if (size === null) continue;

    const quantity = typeof item.quantity === 'number' ? Math.trunc(item.quantity) : Number.NaN;
    if (!Number.isFinite(quantity) || quantity < 1) continue;

    lines.push({ product_id: productId, size, quantity });
  }
  return lines;
}
