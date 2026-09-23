import assert from 'node:assert';
import { mergeCart, mergeWishlist } from '@/lib/merge';
import type { Product } from '@/lib/storefront-types';
import type { CartItem } from '@/store/cart-store';

const p1 = { id: 'p1' } as Product;
const p2 = { id: 'p2' } as Product;
const p3 = { id: 'p3' } as Product;

const item = (product: Product, size: string, quantity: number): CartItem => ({
  product,
  size,
  quantity,
});

// Wishlist: no duplicates, remote first, local extras appended.
const wishlist = mergeWishlist([p1, p2, p1], [p2, p3]);
assert.strictEqual(wishlist.length, 3);
assert.deepStrictEqual(
  wishlist.map((p) => p.id),
  ['p2', 'p3', 'p1']
);

// Cart: same product+size combine quantities; distinct lines merge separately.
const cart = mergeCart(
  [item(p1, 'M', 1), item(p1, 'M', 2), item(p2, 'L', 1), item(p3, 'M', 5)],
  [item(p1, 'M', 1), item(p2, 'M', 4)]
);
assert.strictEqual(cart.length, 4);
assert.strictEqual(cart.find((i) => i.product.id === 'p1' && i.size === 'M')?.quantity, 4);
assert.strictEqual(cart.find((i) => i.product.id === 'p2' && i.size === 'L')?.quantity, 1);
assert.strictEqual(cart.find((i) => i.product.id === 'p2' && i.size === 'M')?.quantity, 4);
assert.strictEqual(cart.find((i) => i.product.id === 'p3')?.quantity, 5);

console.log('merge checks OK');