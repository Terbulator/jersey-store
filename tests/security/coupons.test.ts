import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { computeOrderTotals, evaluateCoupon, resolveShipping, type CouponRow } from '@/lib/coupon-rules';

const NOW = new Date('2026-10-03T12:00:00Z');

const coupon = (overrides: Partial<CouponRow> = {}): CouponRow => ({
  id: 'coupon-1',
  code: 'SAVE20',
  type: 'percent',
  value: 20,
  min_spend: null,
  max_discount: null,
  max_uses: null,
  used_count: 0,
  valid_from: null,
  valid_until: null,
  active: true,
  ...overrides,
});

describe('coupon validation', () => {
  test('an unknown code is rejected with no discount', () => {
    const result = evaluateCoupon(null, 1000, NOW);
    assert.equal(result.valid, false);
    assert.equal(result.discount, 0);
    assert.equal(result.couponId, null);
  });

  test('an inactive coupon is rejected', () => {
    const result = evaluateCoupon(coupon({ active: false }), 1000, NOW);
    assert.equal(result.valid, false);
    assert.equal(result.discount, 0);
  });

  test('an expired coupon is rejected', () => {
    const result = evaluateCoupon(coupon({ valid_until: '2026-10-01T00:00:00Z' }), 1000, NOW);
    assert.equal(result.valid, false);
    assert.match(String(result.error), /expired/i);
  });

  test('a coupon that has not started yet is rejected', () => {
    const result = evaluateCoupon(coupon({ valid_from: '2026-11-01T00:00:00Z' }), 1000, NOW);
    assert.equal(result.valid, false);
  });

  test('a coupon inside its window is accepted', () => {
    const result = evaluateCoupon(
      coupon({ valid_from: '2026-10-01T00:00:00Z', valid_until: '2026-10-31T00:00:00Z' }),
      1000,
      NOW
    );
    assert.equal(result.valid, true);
    assert.equal(result.discount, 200);
  });

  test('an exhausted coupon is rejected at exactly max_uses', () => {
    const result = evaluateCoupon(coupon({ max_uses: 5, used_count: 5 }), 1000, NOW);
    assert.equal(result.valid, false);
    assert.match(String(result.error), /usage limit/i);
  });

  test('a coupon one use short of the limit is accepted', () => {
    const result = evaluateCoupon(coupon({ max_uses: 5, used_count: 4 }), 1000, NOW);
    assert.equal(result.valid, true);
  });

  test('an unlimited coupon ignores used_count', () => {
    const result = evaluateCoupon(coupon({ max_uses: null, used_count: 9_999_999 }), 1000, NOW);
    assert.equal(result.valid, true);
  });

  test('a coupon below the minimum spend is rejected', () => {
    const result = evaluateCoupon(coupon({ min_spend: 2000 }), 1500, NOW);
    assert.equal(result.valid, false);
    assert.equal(result.discount, 0);
  });

  test('an unknown coupon type is rejected rather than treated as free money', () => {
    const result = evaluateCoupon(coupon({ type: 'giftcard', value: 500 }), 1000, NOW);
    assert.equal(result.valid, false);
    assert.equal(result.discount, 0);
  });
});

describe('coupon discount is computed server-side', () => {
  test('percent coupons use the stored rate against the server subtotal', () => {
    assert.equal(evaluateCoupon(coupon({ value: 20 }), 2500, NOW).discount, 500);
    assert.equal(evaluateCoupon(coupon({ value: 10 }), 1999, NOW).discount, 199.9);
  });

  test('max_discount caps a percent coupon', () => {
    const result = evaluateCoupon(coupon({ value: 50, max_discount: 300 }), 2000, NOW);
    assert.equal(result.discount, 300);
  });

  test('fixed coupons are capped at the subtotal', () => {
    const result = evaluateCoupon(coupon({ type: 'fixed', value: 5000 }), 1000, NOW);
    assert.equal(result.discount, 1000);
  });

  test('a misconfigured percent rate above 100 cannot exceed the subtotal', () => {
    const result = evaluateCoupon(coupon({ value: 500 }), 1000, NOW);
    assert.equal(result.discount, 1000);
  });

  test('a negative stored value cannot create a surcharge', () => {
    const result = evaluateCoupon(coupon({ type: 'fixed', value: -500 }), 1000, NOW);
    assert.equal(result.discount, 0);
  });

  test('no client-supplied amount is consulted', () => {
    // The function's entire input is the stored row plus the server subtotal, so a
    // caller cannot smuggle a discount in.
    const result = evaluateCoupon(coupon({ value: 20 }), 1000, NOW);
    assert.deepEqual(Object.keys(result).sort(), ['couponId', 'discount', 'valid']);
  });
});

describe('order totals can never go negative', () => {
  test('a discount equal to the subtotal leaves only shipping', () => {
    const totals = computeOrderTotals({ subtotal: 1000, shipping: 99, discount: 1000 });
    assert.equal(totals.total, 99);
  });

  test('a discount larger than the subtotal is clamped and the total floors at zero', () => {
    const totals = computeOrderTotals({ subtotal: 1000, shipping: 99, discount: 5000 });
    assert.equal(totals.discount, 1000);
    assert.equal(totals.total, 99);
  });

  test('a negative discount does not increase the total', () => {
    const totals = computeOrderTotals({ subtotal: 1000, shipping: 99, discount: -250 });
    assert.equal(totals.discount, 0);
    assert.equal(totals.total, 1099);
  });

  test('negative subtotal or shipping are floored at zero', () => {
    const totals = computeOrderTotals({ subtotal: -500, shipping: -20, discount: 0 });
    assert.equal(totals.subtotal, 0);
    assert.equal(totals.shipping, 0);
    assert.equal(totals.total, 0);
  });

  test('NaN and Infinity inputs cannot poison the total', () => {
    const totals = computeOrderTotals({ subtotal: Number.NaN, shipping: Number.POSITIVE_INFINITY, discount: Number.NaN });
    assert.equal(Number.isFinite(totals.total), true);
    assert.equal(totals.total, 0);
  });

  test('rounding stays at two decimals', () => {
    const totals = computeOrderTotals({ subtotal: 33.333, shipping: 9.999, discount: 0 });
    assert.equal(totals.subtotal, 33.33);
    assert.equal(totals.shipping, 10);
  });

  test('a full end-to-end coupon checkout still produces a sane total', () => {
    const subtotal = 2499;
    const discount = evaluateCoupon(coupon({ value: 10, max_discount: 200 }), subtotal, NOW).discount;
    const shipping = resolveShipping(subtotal, { freeThreshold: 999, standardRate: 99 });
    const totals = computeOrderTotals({ subtotal, shipping, discount });
    assert.equal(totals.discount, 200);
    assert.equal(totals.shipping, 0);
    assert.equal(totals.total, 2299);
  });
});

describe('shipping is derived from config, not from the client', () => {
  test('standard rate applies at or below the threshold', () => {
    assert.equal(resolveShipping(500, { freeThreshold: 999, standardRate: 99 }), 99);
    assert.equal(resolveShipping(999, { freeThreshold: 999, standardRate: 99 }), 99);
  });

  test('shipping is free strictly above the threshold', () => {
    assert.equal(resolveShipping(1000, { freeThreshold: 999, standardRate: 99 }), 0);
  });

  test('missing config falls back to the documented defaults', () => {
    assert.equal(resolveShipping(500, {}), 99);
    assert.equal(resolveShipping(5000, {}), 0);
  });

  test('a negative configured rate cannot produce a negative charge', () => {
    assert.equal(resolveShipping(500, { freeThreshold: 999, standardRate: -50 }), 0);
  });
});