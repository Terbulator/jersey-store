import { NextRequest, NextResponse } from 'next/server';
import { isRateLimited, rateLimitError, retryAfterMs } from './rate-limit';

// This module holds no secrets (it reads no private env var and constructs no
// service-role client), so it deliberately omits the `server-only` marker in order
// to stay unit-testable. The actual secret boundary is `@/lib/admin-session`.

// ---------------------------------------------------------------------------
// Client IP extraction
// ---------------------------------------------------------------------------

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
// Deliberately permissive but still rejects the shapes an attacker actually sends
// ("unknown", "forged", "" with embedded junk, oversized values).
const IPV6 = /^[0-9a-f:]{2,45}$/i;

function normalizeIp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value || value.length > 45) return null;
  if (value.startsWith('::ffff:')) return normalizeIp(value.slice(7));
  if (IPV4.test(value)) return value;
  if (value.includes(':') && IPV6.test(value)) return value.toLowerCase();
  return null;
}

/**
 * Resolves the caller IP for rate-limit bucketing.
 *
 * Priority order matters. Platform-set headers are written by the edge/ingress and
 * cannot be forged by the client, so they win. `x-forwarded-for` is attacker
 * appendable, so we take the RIGHTMOST entry (the hop closest to us) rather than
 * the leftmost, which is trivially spoofed with `X-Forwarded-For: 1.2.3.4`.
 */
export function getIp(req: NextRequest): string {
  const trusted = [
    req.headers.get('cf-connecting-ip'),
    req.headers.get('x-vercel-forwarded-for'),
    req.headers.get('true-client-ip'),
    req.headers.get('x-real-ip'),
  ];
  for (const candidate of trusted) {
    const ip = normalizeIp(candidate);
    if (ip) return ip;
  }

  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) {
    const parts = fwd.split(',').map((p) => normalizeIp(p));
    const rightmost = parts.filter((p): p is string => p !== null).pop();
    if (rightmost) return rightmost;
  }

  return 'unknown';
}

// ---------------------------------------------------------------------------
// Rate limits
// ---------------------------------------------------------------------------

// Per-scope budgets. Admin mutations share the 'admin' bucket per IP;
// uploads, restores and order tracking are more sensitive or expensive.
const LIMITS = {
  admin: { limit: 120, windowMs: 60_000 },
  upload: { limit: 30, windowMs: 60_000 },
  expensive: { limit: 20, windowMs: 60_000 },
  orders: { limit: 10, windowMs: 60_000 },
  // Tracking is unauthenticated and looks up a row by a secret token, so it is
  // limited harder than order creation.
  tracking: { limit: 20, windowMs: 60_000 },
  reviews: { limit: 5, windowMs: 60_000 },
  auth: { limit: 10, windowMs: 60_000 },
} as const;

export type RateLimitScope = keyof typeof LIMITS;

export function rateLimitKey(scope: RateLimitScope, req: NextRequest): string {
  return `${scope}:${getIp(req)}`;
}

/** Returns a 429 NextResponse when the caller is over budget, otherwise null. */
export function checkRateLimit(req: NextRequest, scope: RateLimitScope = 'admin'): NextResponse | null {
  const { limit, windowMs } = LIMITS[scope];
  const key = rateLimitKey(scope, req);
  if (!isRateLimited(key, limit, windowMs)) return null;
  return rateLimitError(retryAfterMs(key) / 1000);
}

// ---------------------------------------------------------------------------
// Origin / CSRF
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Same-origin enforcement for cookie-authenticated mutations.
 *
 * Browsers always attach `Origin` to cross-site POST/PATCH/DELETE, so requiring it
 * to match the request host neuters CSRF against the cookie-authenticated admin APIs.
 * Requests with no `Origin` (curl, server-to-server) pass — they carry no ambient
 * cookie authority a browser would.
 */
export function checkOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get('origin');
  if (!origin) return null;

  const host = (req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '')
    .split(',')[0]
    .trim();

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  }

  if (originUrl.protocol !== 'https:' && originUrl.protocol !== 'http:') {
    return NextResponse.json({ error: 'Origin not allowed.' }, { status: 403 });
  }
  if (host && originUrl.host !== host) {
    return NextResponse.json({ error: 'Origin not allowed.' }, { status: 403 });
  }
  if (ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(originUrl.origin)) {
    return NextResponse.json({ error: 'Origin not in allowlist.' }, { status: 403 });
  }
  return null;
}

/** Convenience for mutations: origin check then rate limit. */
export function checkMutation(req: NextRequest, scope: RateLimitScope = 'admin'): NextResponse | null {
  return checkOrigin(req) ?? checkRateLimit(req, scope);
}