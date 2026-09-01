import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOwnerUser } from '@/lib/owner-guard';
import { logAudit } from '@/lib/audit';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guarded = await getOwnerUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const existing = await prisma.permissionOverride.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Override not found' }, { status: 404 });

  await prisma.permissionOverride.delete({ where: { id: params.id } });

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'permission.revoke',
    resource: 'permission',
    resourceId: params.id,
    newValues: { userId: existing.userId, permission: existing.permission },
  });

  return NextResponse.json({ ok: true });
}
