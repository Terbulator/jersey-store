import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWorkerUser } from '@/lib/worker-guard';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guarded = await getWorkerUser();
  if (!guarded.ok) return guarded.error;
  const { worker, user } = guarded;

  const existing = await prisma.task.findFirst({ where: { id: params.id, workerId: worker.id } });
  if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.status !== undefined) data.status = body.status;
  if (body.notes !== undefined) data.notes = body.notes ?? null;
  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  const updated = await prisma.task.update({ where: { id: params.id }, data });

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'task.update_status',
    resource: 'task',
    resourceId: params.id,
    oldValues: { status: existing.status },
    newValues: { status: updated.status },
  });

  return NextResponse.json({ task: updated });
}
