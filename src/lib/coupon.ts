import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export interface CouponDiscount {
  code: string;
  discount: number;
}

/**
 * Validate a coupon code and compute its discount against a subtotal.
 * Returns null when invalid. Does not consume usage — consumption happens
 * once when an order is actually created.
 */
export async function applyCoupon(
  code: string | undefined,
  subtotal: number,
  tx: Prisma.TransactionClient = prisma
): Promise<CouponDiscount | null> {
  if (!code || !code.trim()) return null;
  const coupon = await tx.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon) return null;
  if (!coupon.active) return null;
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return null;
  if (coupon.maxUses !== null && coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) return null;
  if (subtotal < Number(coupon.minSubtotal)) return null;

  let discount = (subtotal * coupon.percentOff) / 100;
  if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined) {
    discount = Math.min(discount, Number(coupon.maxDiscount));
  }
  return { code: coupon.code, discount: Math.round(discount * 100) / 100 };
}
