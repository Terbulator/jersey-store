import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOwnerUser } from '@/lib/owner-guard';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guarded = await getOwnerUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const existing = await prisma.task.findFirst({ where: { id: params.id, worker: { ownerId: user.id } } });
  if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description ?? null;
  if (body.status !== undefined) data.status = body.status;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.notes !== undefined) data.notes = body.notes ?? null;
  if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (body.workerId !== undefined) {
    if (body.workerId) {
      const worker = await prisma.worker.findFirst({ where: { id: body.workerId, ownerId: user.id } });
      if (!worker) return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }
    data.workerId = body.workerId ?? null;
  }
  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  const updated = await prisma.task.update({ where: { id: params.id }, data });

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'task.update',
    resource: 'task',
    resourceId: params.id,
    oldValues: { status: existing.status },
    newValues: { status: updated.status },
  });

  return NextResponse.json({ task: updated });
}
