import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWorkerUser } from '@/lib/worker-guard';
import { logAudit } from '@/lib/audit';
export const dynamic = 'force-dynamic';

/**
 * POST /api/worker/tickets — claim an unassigned OPEN ticket.
 * Body: { ticketId: string }
 */
export async function POST(req: NextRequest) {
  const guarded = await getWorkerUser();
  if (!guarded.ok) return guarded.error;
  const { user, worker } = guarded;

  const body = await req.json().catch(() => ({}));
  const ticketId = body?.ticketId as string | undefined;
  if (!ticketId) {
    return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  if (ticket.workerId && ticket.workerId !== worker.id) {
    return NextResponse.json({ error: 'Already assigned to another worker' }, { status: 409 });
  }
  if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
    return NextResponse.json({ error: 'Ticket already closed' }, { status: 409 });
  }

  const updated = await prisma.ticket.update({
    where: { id: ticket.id },
    data: { workerId: worker.id, status: 'IN_PROGRESS' },
  });

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'ticket.assign_self',
    resource: 'ticket',
    resourceId: updated.id,
    newValues: { workerId: worker.id },
  });

  return NextResponse.json({ ok: true, ticketId: updated.id });
}

export async function GET() {
  const guarded = await getWorkerUser();
  if (!guarded.ok) return guarded.error;
  const { worker } = guarded;

  // Assigned to me
  const mine = await prisma.ticket.findMany({
    where: { workerId: worker.id },
    include: {
      customer: { select: { name: true, email: true } },
      order: { select: { orderNumber: true } },
      _count: { select: { replies: true } },
    },
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
  });

  // Open + unassigned (the worker can self-claim these)
  const unassigned = await prisma.ticket.findMany({
    where: { workerId: null, status: 'OPEN' },
    include: {
      customer: { select: { name: true, email: true } },
      order: { select: { orderNumber: true } },
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: 25,
  });

  const map = (t: typeof mine[number]) => ({
    id: t.id,
    subject: t.subject,
    message: t.message,
    status: t.status,
    priority: t.priority,
    orderNumber: t.order?.orderNumber ?? null,
    customer: t.customer.name ?? t.customer.email,
    repliesCount: t._count.replies,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  });

  return NextResponse.json({
    tickets: mine.map(map),
    unassigned: unassigned.map(map),
  });
}
