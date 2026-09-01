import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin-guard';
import { logAudit } from '@/lib/audit';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  const status = req.nextUrl.searchParams.get('status') ?? '';
  const where: Prisma.TicketWhereInput = {};
  if (status) where.status = status as Prisma.TicketWhereInput['status'];

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      customer: { select: { name: true, email: true } },
      worker: { select: { id: true, name: true } },
      order: { select: { orderNumber: true } },
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const mapped = tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    message: t.message,
    status: t.status,
    priority: t.priority,
    customer: t.customer.name ?? t.customer.email,
    worker: t.worker ? { id: t.worker.id, name: t.worker.name } : null,
    orderNumber: t.order?.orderNumber ?? null,
    replyCount: t._count.replies,
    createdAt: t.createdAt,
  }));

  return NextResponse.json({ tickets: mapped });
}
