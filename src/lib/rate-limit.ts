import { NextResponse } from 'next/server';

// NOTE: This is an in-memory rate limiter. It resets on cold starts and does not
// share state across serverless instances. For production, consider upgrading to
// a Redis-backed solution (e.g., Upstash Rate Limit).

const buckets = new Map<string, { count: number; resetAt: number }>();

function keyFor(req: Request): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  return ip;
}

export function rateLimit(req: Request, { limit = 10, windowMs = 60_000 } = {}): {
  limit: number;
  remaining: number;
  ok: boolean;
} {
  const key = keyFor(req);
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limit, remaining: limit - 1, ok: true };
  }

  bucket.count += 1;
  const ok = bucket.count <= limit;
  if (!ok) {
    // drop oldest to avoid unbounded growth
    if (buckets.size > 10_000) {
      const oldest = [...buckets.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt)[0];
      buckets.delete(oldest[0]);
    }
  }
  return { limit, remaining: Math.max(0, limit - bucket.count), ok };
}

export function rateLimitError(req: Request, { limit = 10, windowMs = 60_000 } = {}): NextResponse | null {
  const r = rateLimit(req, { limit, windowMs });
  if (r.ok) return null;
  return NextResponse.json(
    { error: 'Too many requests, please try again later' },
    { status: 429, headers: { 'Retry-After': String(Math.ceil(windowMs / 1000)) } }
  );
}
