import type { Product } from '@/data/products';
import type { CartItem } from '@/store/cart-store';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { createClient } from '@/lib/supabase/client';
import { PRODUCTS } from '@/data/products';
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

function productById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

function toCartItems(rows: RemoteCartRow[]): CartItem[] {
  const items: CartItem[] = [];
  for (const row of rows) {
    const product = productById(row.product_id);
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

  const remoteWishlist = (wishRows ?? [])
    .map((row: { product_id: string }) => productById(row.product_id))
    .filter((p: Product | undefined): p is Product => !!p);

  const mergedWishlist = mergeWishlist(localWishlist, remoteWishlist);
  const mergedCart = mergeCart(localCart, toCartItems(cartRows as RemoteCartRow[]));

  useWishlistStore.setState({ items: mergedWishlist });
  useCartStore.setState({ items: mergedCart, isOpen: false });
}