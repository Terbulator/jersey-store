// ponytail: single-process in-memory limiter, fine for one Vercel/PM2 instance;
// swap for a shared store (Upstash/DB) when the app runs multi-region.
const hits = new Map<string, number[]>();

export function rateLimitError() {
  return new Response('Too many requests. Please try again later.', { status: 429 });
}

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) return true;
  recent.push(now);
  hits.set(key, recent);
  return false;
}