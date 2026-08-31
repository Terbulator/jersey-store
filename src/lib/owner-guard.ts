import { NextResponse } from 'next/server';
import { getSession, SessionUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Vendor } from '@prisma/client';

type GuardResult =
  | { ok: true; user: SessionUser; vendor: Vendor; error: null }
  | { ok: false; user: null; vendor: null; error: NextResponse };

/**
 * Returns the OWNER session plus their Vendor record, or a 401/403 error.
 * Usage:
 *   const guarded = await getOwnerUser();
 *   if (!guarded.ok) return guarded.error;
 *   const { user, vendor } = guarded;
 */
export async function getOwnerUser(): Promise<GuardResult> {
  const user = await getSession();
  if (!user) {
    return { ok: false, user: null, vendor: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (user.role !== 'OWNER') {
    return { ok: false, user: null, vendor: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  const vendor = await prisma.vendor.findUnique({ where: { userId: user.id } });
  if (!vendor) {
    return { ok: false, user: null, vendor: null, error: NextResponse.json({ error: 'No store found' }, { status: 404 }) };
  }
  return { ok: true, user, vendor, error: null };
}
