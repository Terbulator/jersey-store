import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { getWorkerUser } from '@/lib/worker-guard';

export async function GET(req: NextRequest) {
  const guarded = await getWorkerUser();
  if (!guarded.ok) return guarded.error;
  const { worker } = guarded;

  const status = req.nextUrl.searchParams.get('status') ?? '';
  const where: Prisma.TaskWhereInput = { workerId: worker.id };
  if (status) where.status = status as Prisma.TaskWhereInput['status'];

  const tasks = await prisma.task.findMany({
    where,
    include: {
      order: { select: { id: true, orderNumber: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const mapped = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    notes: t.notes,
    order: t.order ? { id: t.order.id, orderNumber: t.order.orderNumber } : null,
    createdAt: t.createdAt,
  }));

  return NextResponse.json({ tasks: mapped });
}
