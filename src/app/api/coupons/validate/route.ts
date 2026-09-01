import { NextRequest, NextResponse } from 'next/server';
import { applyCoupon } from '@/lib/coupon';
import { rateLimitError } from '@/lib/rate-limit';
import { assertSameOrigin } from '@/lib/csrf';

export async function POST(req: NextRequest) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;

  const rateLimited = rateLimitError(req, { limit: 10, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  const body = await req.json().catch(() => ({}));
  const { code, subtotal } = body;
  if (!code || typeof subtotal !== 'number') {
    return NextResponse.json({ error: 'Missing code or subtotal' }, { status: 400 });
  }
  const result = await applyCoupon(code, subtotal);
  if (!result) return NextResponse.json({ valid: false });
  return NextResponse.json({ valid: true, code: result.code, discount: result.discount });
}
