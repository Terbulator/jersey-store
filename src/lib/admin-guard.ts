import { NextResponse } from 'next/server';
import { getSession, SessionUser } from '@/lib/session';

type GuardResult =
  | { ok: true; user: SessionUser; error: null }
  | { ok: false; user: null; error: NextResponse };

/**
 * Returns the admin session or a 401/403 error response.
 * Usage:
 *   const guarded = await getAdminUser();
 *   if (!guarded.ok) return guarded.error;
 *   const user = guarded.user;
 */
export async function getAdminUser(): Promise<GuardResult> {
  const user = await getSession();
  if (!user) {
    return { ok: false, user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (user.role !== 'ADMIN') {
    return { ok: false, user: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { ok: true, user, error: null };
}
