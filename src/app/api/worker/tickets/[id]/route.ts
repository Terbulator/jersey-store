import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWorkerUser } from '@/lib/worker-guard';
import { logAudit } from '@/lib/audit';
import { TicketStatus } from '@prisma/client';
import { z } from 'zod';

const schema = z.object({
  message: z.string().min(1).max(4000).optional(),
  status: z.nativeEnum(TicketStatus).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guarded = await getWorkerUser();
  if (!guarded.ok) return guarded.error;
  const { user, worker } = guarded;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const { message, status } = parsed.data;

  const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
  if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  if (ticket.workerId !== worker.id) {
    return NextResponse.json({ error: 'Not your assigned ticket' }, { status: 403 });
  }

  let replyId: string | null = null;
  if (message) {
    const reply = await prisma.ticketReply.create({
      data: { ticketId: ticket.id, authorId: user.id, message },
    });
    replyId = reply.id;
  }

  if (status && status !== ticket.status) {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: status === 'IN_PROGRESS' ? 'IN_PROGRESS' : status === 'RESOLVED' ? 'RESOLVED' : status === 'CLOSED' ? 'CLOSED' : 'OPEN' },
    });
  }

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'ticket.update',
    resource: 'ticket',
    resourceId: ticket.id,
    newValues: { status, replyId },
  });

  return NextResponse.json({ ok: true });
}
