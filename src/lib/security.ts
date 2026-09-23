import { NextRequest, NextResponse } from 'next/server';
import { isRateLimited, rateLimitError } from './rate-limit';

export function getIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

// Per-scope budgets. Admin mutations share the 'admin' bucket per IP;
// uploads and restores are expensive and get tighter budgets.
const LIMITS: Record<string, { limit: number; windowMs: number }> = {
  admin: { limit: 120, windowMs: 60_000 },
  upload: { limit: 30, windowMs: 60_000 },
  expensive: { limit: 20, windowMs: 60_000 },
};

export function checkRateLimit(req: NextRequest, scope: keyof typeof LIMITS = 'admin'): Response | null {
  const { limit, windowMs } = LIMITS[scope];
  if (isRateLimited(`${scope}:${getIp(req)}`, limit, windowMs)) return rateLimitError();
  return null;
}

// Same-origin enforcement for cookie-authenticated mutations. Requests
// without an Origin header (curl, server-to-server) pass; a mismatched
// Origin/Host pair is rejected — this neuters CSRF against admin APIs.
export function checkOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get('origin');
  if (!origin) return null;
  const host = (req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '').split(',')[0].trim();
  try {
    if (host && new URL(origin).host !== host) {
      return NextResponse.json({ error: 'Origin not allowed.' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  }
  return null;
}
