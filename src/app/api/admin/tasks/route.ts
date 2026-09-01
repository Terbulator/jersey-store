import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getAdminUser } from '@/lib/admin-guard';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const status = req.nextUrl.searchParams.get('status') ?? '';
  const where: Prisma.TaskWhereInput = {};
  if (status) where.status = status as Prisma.TaskWhereInput['status'];

  const tasks = await prisma.task.findMany({
    where,
    include: {
      worker: { select: { id: true, name: true } },
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
    worker: t.worker ? { id: t.worker.id, name: t.worker.name } : null,
    order: t.order ? { id: t.order.id, orderNumber: t.order.orderNumber } : null,
    createdAt: t.createdAt,
  }));

  return NextResponse.json({ tasks: mapped });
}

export async function POST(req: NextRequest) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const body = await req.json();
  const { title, description, workerId, orderId, priority, dueDate } = body;
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  if (workerId) {
    const worker = await prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
  }

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? null,
        workerId: workerId ?? null,
        orderId: orderId ?? null,
        priority: priority ?? 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'task.create',
      resource: 'task',
      resourceId: task.id,
      newValues: { title, workerId },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
