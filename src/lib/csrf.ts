import { NextRequest, NextResponse } from 'next/server';

function normalizeOrigin(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * Same-origin CSRF guard for cookie-authenticated mutation endpoints.
 * Blocks cross-origin POST/PATCH/PUT/DELETE (e.g. hostile site forging a
 * request against a logged-in user's session). Returns a NextResponse on
 * failure, or null when the request is safe to proceed.
 */
export function assertSameOrigin(req: NextRequest): NextResponse | null {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return null;
  }

  const host = req.headers.get('host');
  const origin = normalizeOrigin(req.headers.get('origin'));
  const referer = normalizeOrigin(req.headers.get('referer'));

  // Browsers always send an Origin on cross-origin POST; missing Origin for a
  // state-changing request comes from curl/POSTman/non-browser clients, which
  // cannot carry the user's cookies anyway. Allow only same-origin.
  if (origin && host && origin !== `http://${host}` && origin !== `https://${host}`) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }
  if (referer && host && referer !== `http://${host}` && referer !== `https://${host}`) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  return null;
}