import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWorkerUser } from '@/lib/worker-guard';
import { logAudit } from '@/lib/audit';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/worker/tickets/[id] — reply to or change the status of a ticket the worker owns.
 * Body: { status?: string, message?: string }
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guarded = await getWorkerUser();
  if (!guarded.ok) return guarded.error;
  const { user, worker } = guarded;

  const existing = await prisma.ticket.findFirst({
    where: { id: params.id, workerId: worker.id },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const { status, message } = await req.json().catch(() => ({}));

  if (message && typeof message === 'string' && message.trim()) {
    await prisma.ticketReply.create({
      data: { ticketId: existing.id, authorId: user.id, message: message.trim() },
    });
  }

  const data: Record<string, unknown> = {};
  if (status && STATUSES.includes(status)) data.status = status;

  let updated = existing;
  if (Object.keys(data).length > 0) {
    updated = await prisma.ticket.update({ where: { id: existing.id }, data });
  }

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'ticket.update',
    resource: 'ticket',
    resourceId: existing.id,
    oldValues: { status: existing.status, replied: !!message },
    newValues: { status: updated.status },
  });

  return NextResponse.json({ ticket: updated });
}