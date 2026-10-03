import { NextResponse } from 'next/server';

// Fixed-window counter kept in process memory.
//
// Scope note (accepted residual risk): this store is per server instance, so on a
// multi-instance/serverless deployment the effective limit is `limit x instances`.
// It still stops a single client hammering one warm instance. Move `hits` behind a
// shared store (Upstash/Redis/Postgres) before scaling out.

type Bucket = { count: number; resetAt: number };

const hits = new Map<string, Bucket>();

// Bound the map so unauthenticated callers cannot grow it without limit (memory DoS).
const MAX_BUCKETS = 10_000;

function sweep(now: number): void {
  if (hits.size < MAX_BUCKETS) return;
  for (const [key, bucket] of hits) {
    if (bucket.resetAt <= now) hits.delete(key);
  }
  // Still oversized (all buckets fresh): drop the oldest insertions until bounded.
  if (hits.size >= MAX_BUCKETS) {
    const excess = hits.size - MAX_BUCKETS + 1;
    let removed = 0;
    for (const key of hits.keys()) {
      hits.delete(key);
      if (++removed >= excess) break;
    }
  }
}

/**
 * Records a hit against `key` and reports whether the caller is over budget.
 * Returns true when the request must be rejected.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = hits.get(key);

  if (!bucket || bucket.resetAt <= now) {
    sweep(now);
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (bucket.count >= limit) return true;

  bucket.count += 1;
  return false;
}

/** Milliseconds until the current window for `key` resets. */
export function retryAfterMs(key: string): number {
  const bucket = hits.get(key);
  if (!bucket) return 0;
  return Math.max(0, bucket.resetAt - Date.now());
}

export function resetRateLimit(key: string): void {
  hits.delete(key);
}

export function rateLimitError(retryAfterSeconds?: number): NextResponse {
  const headers: Record<string, string> = {};
  if (retryAfterSeconds && retryAfterSeconds > 0) {
    headers['Retry-After'] = String(Math.ceil(retryAfterSeconds));
  }
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429, headers }
  );
}