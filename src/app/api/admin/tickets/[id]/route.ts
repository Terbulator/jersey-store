import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin-guard';
import { logAudit } from '@/lib/audit';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const existing = await prisma.ticket.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

  const body = await req.json();
  const { status, workerId, message } = body;

  if (message) {
    await prisma.ticketReply.create({
      data: { ticketId: params.id, authorId: user.id, message },
    });
  }

  const data: Record<string, unknown> = {};
  if (status && STATUSES.includes(status)) data.status = status;
  if (workerId !== undefined) {
    const worker = workerId ? await prisma.worker.findUnique({ where: { id: workerId } }) : null;
    if (workerId && !worker) return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    data.workerId = workerId || null;
  }

  let updated = existing;
  if (Object.keys(data).length > 0) {
    updated = await prisma.ticket.update({ where: { id: params.id }, data });
  }

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'ticket.update',
    resource: 'ticket',
    resourceId: params.id,
    oldValues: { status: existing.status },
    newValues: { status: updated.status },
  });

  return NextResponse.json({ ticket: updated });
}
