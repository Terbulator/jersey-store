import type { Product } from '@/lib/storefront-types';
import { mapProduct } from '@/lib/storefront-types';
import type { CartItem } from '@/store/cart-store';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { createClient } from '@/lib/supabase/client';
import { mergeCart, mergeWishlist } from '@/lib/merge';

export { mergeCart, mergeWishlist };

export function persistenceEnabled() {
  return process.env.NEXT_PUBLIC_SUPABASE_PERSISTENCE === 'true';
}

interface RemoteCartRow {
  product_id: string;
  size: string;
  quantity: number;
}

async function productsByIds(ids: string[]): Promise<Map<string, Product>> {
  if (ids.length === 0) return new Map();
  const supabase = createClient();
  const { data } = await supabase.from('products').select('*').in('id', ids);
  const map = new Map<string, Product>();
  for (const row of data ?? []) {
    const product = mapProduct(row);
    map.set(product.id, product);
  }
  return map;
}

async function toCartItems(rows: RemoteCartRow[]): Promise<CartItem[]> {
  if (rows.length === 0) return [];
  const byId = await productsByIds(rows.map((r) => r.product_id));
  const items: CartItem[] = [];
  for (const row of rows) {
    const product = byId.get(row.product_id);
    if (!product) continue; // catalog changed; drop orphaned line
    items.push({ product, size: row.size, quantity: row.quantity });
  }
  return items;
}

/**
 * Merge and write BOTH directions when persistence is enabled:
 * local guest data -> Supabase tables, and any Supabase data -> local stores.
 * No-op when NEXT_PUBLIC_SUPABASE_PERSISTENCE is not "true".
 */
export async function syncGuestData(userId: string) {
  if (!persistenceEnabled()) return;

  const supabase = createClient();
  const localWishlist = useWishlistStore.getState().items;
  const localCart = useCartStore.getState().items;

  if (localWishlist.length > 0) {
    await supabase
      .from('wishlist_items')
      .upsert(
        localWishlist.map((p) => ({ user_id: userId, product_id: p.id })),
        { onConflict: 'user_id,product_id', ignoreDuplicates: true }
      );
  }

  if (localCart.length > 0) {
    await supabase.from('cart').upsert({ user_id: userId, updated_at: new Date().toISOString() });
    await supabase
      .from('cart_items')
      .upsert(
        localCart.map((item) => ({
          cart_user_id: userId,
          product_id: item.product.id,
          size: item.size,
          quantity: item.quantity,
        })),
        { onConflict: 'cart_user_id,product_id,size' }
      );
  }

  const [{ data: wishRows }, { data: cartRows }] = await Promise.all([
    supabase.from('wishlist_items').select('product_id').eq('user_id', userId),
    supabase.from('cart_items').select('*').eq('cart_user_id', userId),
  ]);

  const wishIds = (wishRows ?? []).map((row: { product_id: string }) => row.product_id);
  const remoteWishlist = [...(await productsByIds(wishIds)).values()];

  const mergedWishlist = mergeWishlist(localWishlist, remoteWishlist);
  const mergedCart = mergeCart(localCart, await toCartItems(cartRows as RemoteCartRow[]));

  useWishlistStore.setState({ items: mergedWishlist });
  useCartStore.setState({ items: mergedCart, isOpen: false });
}