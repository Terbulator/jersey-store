import { NextResponse } from 'next/server';
import { getSession, SessionUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Reseller } from '@prisma/client';

type GuardResult =
  | { ok: true; user: SessionUser; reseller: Reseller; error: null }
  | { ok: false; user: null; reseller: null; error: NextResponse };

/**
 * Returns the RESELLER session plus their Reseller profile, or a 401/403 error.
 */
export async function getResellerUser(): Promise<GuardResult> {
  const user = await getSession();
  if (!user) {
    return { ok: false, user: null, reseller: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (user.role === 'OWNER' || user.role === 'WORKER' || user.role === 'ADMIN') {
    return { ok: false, user: null, reseller: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  const reseller = await prisma.reseller.findUnique({ where: { userId: user.id } });
  if (!reseller) {
    return { ok: false, user: null, reseller: null, error: NextResponse.json({ error: 'Reseller profile not found' }, { status: 404 }) };
  }
  if (reseller.status !== 'APPROVED') {
    return { ok: false, user: null, reseller: null, error: NextResponse.json({ error: 'Reseller account not approved' }, { status: 403 }) };
  }
  return { ok: true, user, reseller, error: null };
}
