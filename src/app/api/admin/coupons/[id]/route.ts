import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin-guard';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const existing = await prisma.coupon.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.active === 'boolean') data.active = body.active;
  if (typeof body.percentOff === 'number') data.percentOff = body.percentOff;
  if (body.code) data.code = String(body.code).trim().toUpperCase();
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const updated = await prisma.coupon.update({ where: { id: params.id }, data });

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'coupon.update',
    resource: 'coupon',
    resourceId: updated.id,
    oldValues: { active: existing.active, percentOff: existing.percentOff },
    newValues: { active: updated.active, percentOff: updated.percentOff },
  });

  return NextResponse.json({ coupon: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const existing = await prisma.coupon.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });

  await prisma.coupon.delete({ where: { id: params.id } });

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'coupon.delete',
    resource: 'coupon',
    resourceId: params.id,
    newValues: { code: existing.code },
  });

  return NextResponse.json({ ok: true });
}
