import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOwnerUser } from '@/lib/owner-guard';
import { logAudit } from '@/lib/audit';
import { GrantType } from '@prisma/client';

const GRANT_TYPES: GrantType[] = ['PERMANENT', 'TEMPORARY', 'ONE_TIME'];

export async function GET() {
  const guarded = await getOwnerUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const workers = await prisma.worker.findMany({
    where: { ownerId: user.id },
    select: { userId: true },
  });
  const workerUserIds = workers.map((w) => w.userId);

  const staff = await prisma.user.findMany({
    where: {
      id: { in: workerUserIds },
    },
    include: {
      permissionOverrides: true,
      reseller: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const mapped = staff.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    resellerTier: u.reseller?.tier ?? null,
    overrides: u.permissionOverrides.map((o) => ({
      id: o.id,
      permission: o.permission,
      access: o.access,
      grantType: o.grantType,
      expiresAt: o.expiresAt,
      reason: o.reason,
      grantedBy: o.grantedBy,
    })),
  }));

  return NextResponse.json({ staff: mapped });
}

export async function POST(req: NextRequest) {
  const guarded = await getOwnerUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const body = await req.json();
  const { userId, permission, access, grantType, expiresAt, reason } = body;
  if (!userId || !permission) {
    return NextResponse.json({ error: 'userId and permission are required' }, { status: 400 });
  }
  if (grantType && !GRANT_TYPES.includes(grantType)) {
    return NextResponse.json({ error: 'Invalid grant type' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const type = grantType ?? 'PERMANENT';
  const exists = await prisma.permissionOverride.findUnique({
    where: { userId_permission: { userId, permission } },
  });

  const override = exists
    ? await prisma.permissionOverride.update({
        where: { userId_permission: { userId, permission } },
        data: {
          access: access ?? 'GRANT',
          grantType: type,
          expiresAt: type === 'TEMPORARY' && expiresAt ? new Date(expiresAt) : null,
          reason: reason ?? null,
          grantedBy: user.name ?? user.email,
        },
      })
    : await prisma.permissionOverride.create({
        data: {
          userId,
          permission,
          access: access ?? 'GRANT',
          grantType: type,
          expiresAt: type === 'TEMPORARY' && expiresAt ? new Date(expiresAt) : null,
          reason: reason ?? null,
          grantedBy: user.name ?? user.email,
        },
      });

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'permission.override',
    resource: 'permission',
    resourceId: override.id,
    newValues: { userId, permission, access: override.access, grantType: override.grantType },
  });

  return NextResponse.json({ override }, { status: exists ? 200 : 201 });
}
