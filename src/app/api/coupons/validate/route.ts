import { NextRequest, NextResponse } from 'next/server';
import { applyCoupon } from '@/lib/coupon';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { code, subtotal } = body;
  if (!code || typeof subtotal !== 'number') {
    return NextResponse.json({ error: 'Missing code or subtotal' }, { status: 400 });
  }
  const result = await applyCoupon(code, subtotal);
  if (!result) return NextResponse.json({ valid: false });
  return NextResponse.json({ valid: true, code: result.code, discount: result.discount });
}
