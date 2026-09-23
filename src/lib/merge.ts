import type { Product } from '@/lib/storefront-types';
import type { CartItem } from '@/store/cart-store';

export function mergeWishlist(local: Product[], remote: Product[]): Product[] {
  const merged: Product[] = [...remote];
  const ids = new Set(remote.map((p) => p.id));
  for (const p of local) {
    if (!ids.has(p.id)) {
      merged.push(p);
      ids.add(p.id);
    }
  }
  return merged;
}

export function mergeCart(local: CartItem[], remote: CartItem[]): CartItem[] {
  const byKey = new Map<string, CartItem>();
  for (const item of remote) byKey.set(`${item.product.id}:${item.size}`, item);
  for (const item of local) {
    const key = `${item.product.id}:${item.size}`;
    const existing = byKey.get(key);
    byKey.set(key, existing ? { ...existing, quantity: existing.quantity + item.quantity } : item);
  }
  return [...byKey.values()];
}