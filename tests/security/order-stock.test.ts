import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { toStockLines } from '@/lib/order-stock';

// `reserve_order_stock` / `release_order_stock` read `product_id` out of the JSON
// they are given, while order line items are stored in camelCase. The admin
// cancel/refund path used to hand the raw stored `items` to `release_order_stock`,
// so every `product_id` resolved to NULL, no variant row matched, and cancelling an
// order silently released zero stock. These tests pin the normalisation that fixed it.

const UUID_A = '11111111-1111-4111-8111-111111111111';
const UUID_B = '22222222-2222-4222-8222-222222222222';

describe('toStockLines', () => {
  test('maps camelCase productId to the snake_case the RPCs read', () => {
    const result = toStockLines([{ productId: UUID_A, size: 'M', quantity: 2 }]);
    assert.deepEqual(result, [{ product_id: UUID_A, size: 'M', quantity: 2 }]);
  });

  test('maps multiple lines in order', () => {
    const result = toStockLines([
      { productId: UUID_A, size: 'S', quantity: 1 },
      { productId: UUID_B, size: 'L', quantity: 3 },
    ]);
    assert.equal(result.length, 2);
    assert.equal(result[0].product_id, UUID_A);
    assert.equal(result[1].product_id, UUID_B);
    assert.equal(result[1].quantity, 3);
  });

  test('accepts already-snake_case input', () => {
    const result = toStockLines([{ product_id: UUID_A, size: 'M', quantity: 1 }]);
    assert.deepEqual(result, [{ product_id: UUID_A, size: 'M', quantity: 1 }]);
  });

  test('carries the stored display fields through without needing them', () => {
    // `items` jsonb also holds name/slug/image/price; only the three stock fields
    // are needed and the rest must not leak into the RPC payload.
    const result = toStockLines([
      {
        productId: UUID_A,
        name: 'Home Jersey',
        slug: 'home-jersey',
        image: 'https://example.test/a.jpg',
        size: 'XL',
        quantity: 4,
        price: 2499,
      },
    ]);
    assert.deepEqual(Object.keys(result[0]).sort(), ['product_id', 'quantity', 'size']);
  });

  test('returns an empty array for non-array input', () => {
    assert.deepEqual(toStockLines(null), []);
    assert.deepEqual(toStockLines(undefined), []);
    assert.deepEqual(toStockLines('nope'), []);
    assert.deepEqual(toStockLines({}), []);
    assert.deepEqual(toStockLines(42), []);
  });

  test('drops lines with a missing or malformed product id', () => {
    const result = toStockLines([
      { size: 'M', quantity: 1 },
      { productId: '', size: 'M', quantity: 1 },
      { productId: 'not-a-uuid', size: 'M', quantity: 1 },
      { productId: null, size: 'M', quantity: 1 },
      { productId: UUID_A, size: 'M', quantity: 1 },
    ]);
    assert.equal(result.length, 1);
    assert.equal(result[0].product_id, UUID_A);
  });

  test('drops lines with a missing size', () => {
    const result = toStockLines([
      { productId: UUID_A, quantity: 1 },
      { productId: UUID_A, size: null, quantity: 1 },
    ]);
    assert.deepEqual(result, []);
  });

  test('drops lines with a non-positive or non-numeric quantity', () => {
    const result = toStockLines([
      { productId: UUID_A, size: 'M', quantity: 0 },
      { productId: UUID_A, size: 'M', quantity: -3 },
      { productId: UUID_A, size: 'M' },
      { productId: UUID_A, size: 'M', quantity: 'two' },
    ]);
    assert.deepEqual(result, []);
  });

  test('truncates a fractional quantity', () => {
    const result = toStockLines([{ productId: UUID_A, size: 'M', quantity: 2.9 }]);
    assert.equal(result[0].quantity, 2);
  });

  test('skips non-object entries without throwing', () => {
    const result = toStockLines([null, 'x', 7, [], { productId: UUID_A, size: 'M', quantity: 1 }]);
    assert.equal(result.length, 1);
  });
});
