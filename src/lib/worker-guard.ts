import { NextResponse } from 'next/server';
import { getSession, SessionUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Worker } from '@/generated/prisma/client';

type GuardResult =
  | { ok: true; user: SessionUser; worker: Worker; error: null }
  | { ok: false; user: null; worker: null; error: NextResponse };

/**
 * Returns the WORKER session plus their Worker profile, or a 401/403 error.
 */
export async function getWorkerUser(): Promise<GuardResult> {
  const user = await getSession();
  if (!user) {
    return { ok: false, user: null, worker: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (user.role !== 'WORKER') {
    return { ok: false, user: null, worker: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  const worker = await prisma.worker.findUnique({ where: { userId: user.id } });
  if (!worker) {
    return { ok: false, user: null, worker: null, error: NextResponse.json({ error: 'Worker profile not found' }, { status: 404 }) };
  }
  return { ok: true, user, worker, error: null };
}
