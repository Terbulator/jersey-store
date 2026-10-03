// Coupon evaluation. Every value here is derived from the stored coupon row and the
// server-computed subtotal — the client never supplies a discount amount, a
// percentage, or a total.
//
// The single most important rule in this file: a discount can never exceed the
// subtotal, so `total` can never go negative.

export type CouponRow = {
  id: string;
  code: string;
  type: string;
  value: number | string;
  min_spend: number | string | null;
  max_discount: number | string | null;
  max_uses: number | null;
  used_count: number | null;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean | null;
};

export type CouponCheck = {
  valid: boolean;
  discount: number;
  couponId: string | null;
  error?: string;
};

const MAX_PERCENT = 100;

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function money(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Validates a coupon against a server-computed subtotal and returns the discount
 * the server is willing to apply.
 *
 * `now` is injectable so expiry behaviour is testable without faking the clock.
 */
export function evaluateCoupon(
  coupon: CouponRow | null | undefined,
  subtotal: number,
  now: Date = new Date()
): CouponCheck {
  if (!coupon) return { valid: false, discount: 0, couponId: null, error: 'Invalid coupon code.' };
  if (!coupon.active) return { valid: false, discount: 0, couponId: null, error: 'Coupon is not active.' };

  if (coupon.valid_from && new Date(coupon.valid_from).getTime() > now.getTime()) {
    return { valid: false, discount: 0, couponId: null, error: 'Coupon is not active yet.' };
  }
  if (coupon.valid_until && new Date(coupon.valid_until).getTime() < now.getTime()) {
    return { valid: false, discount: 0, couponId: null, error: 'Coupon has expired.' };
  }

  const maxUses = coupon.max_uses == null ? null : num(coupon.max_uses);
  if (maxUses !== null && num(coupon.used_count) >= maxUses) {
    return { valid: false, discount: 0, couponId: null, error: 'Coupon usage limit reached.' };
  }

  const safeSubtotal = Math.max(0, money(subtotal));
  const minSpend = coupon.min_spend == null ? null : num(coupon.min_spend);
  if (minSpend !== null && safeSubtotal < minSpend) {
    return { valid: false, discount: 0, couponId: null, error: 'Minimum spend not met.' };
  }

  const cap = coupon.max_discount == null ? null : num(coupon.max_discount);
  let discount: number;

  if (coupon.type === 'percent') {
    // Clamp the rate: a misconfigured 500 "percent" coupon must not become a
    // 500% discount.
    const rate = Math.min(Math.max(num(coupon.value), 0), MAX_PERCENT);
    discount = money((safeSubtotal * rate) / 100);
    if (cap !== null) discount = Math.min(discount, cap);
  } else if (coupon.type === 'fixed') {
    discount = Math.min(Math.max(num(coupon.value), 0), safeSubtotal);
    if (cap !== null) discount = Math.min(discount, cap);
  } else {
    return { valid: false, discount: 0, couponId: null, error: 'Unsupported coupon type.' };
  }

  // Final clamp. The discount is never worth more than the goods, so the caller can
  // compute `subtotal + shipping - discount` without going negative.
  discount = money(Math.min(Math.max(discount, 0), safeSubtotal));

  return { valid: true, discount, couponId: coupon.id };
}

/**
 * Order money maths, kept in one place so the clamp cannot be forgotten.
 * `discount` is floored at the subtotal, which means shipping stays payable but the
 * goods total can never drop below zero.
 */
export function computeOrderTotals(input: {
  subtotal: number;
  shipping: number;
  discount: number;
}): { subtotal: number; shipping: number; discount: number; total: number } {
  const subtotal = money(Math.max(0, num(input.subtotal)));
  const shipping = money(Math.max(0, num(input.shipping)));
  const discount = money(Math.min(Math.max(num(input.discount), 0), subtotal));
  const total = money(Math.max(0, subtotal + shipping - discount));
  return { subtotal, shipping, discount, total };
}

export type ShippingConfig = { freeThreshold?: number; standardRate?: number };

export function resolveShipping(subtotal: number, config: ShippingConfig): number {
  const freeThreshold = num(config.freeThreshold, 999);
  const standardRate = Math.max(0, num(config.standardRate, 99));
  // Preserves the original checkout behaviour: free shipping applies strictly above
  // the threshold, not at it.
  if (subtotal > freeThreshold) return 0;
  return money(standardRate);
}