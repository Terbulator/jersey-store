import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin-guard';
import { logAudit } from '@/lib/audit';
import { VendorStatus } from '@/generated/prisma/client';

export async function GET(req: NextRequest) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  const status = req.nextUrl.searchParams.get('status') ?? '';

  const where = status ? { status: status as VendorStatus } : {};

  const owners = await prisma.vendor.findMany({
    where,
    include: {
      user: { select: { id: true, email: true, name: true } },
      _count: { select: { products: true, payouts: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ owners });
}

const ACTION_BY_STATUS: Record<string, string> = {
  APPROVED: 'owners.approve',
  SUSPENDED: 'owners.suspend',
  PENDING: 'owners.update',
};

export async function PATCH(req: NextRequest) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  const body = await req.json();
  const { vendorId, status } = body;

  if (!vendorId || !Object.values(VendorStatus).includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const existing = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!existing) return NextResponse.json({ error: 'Owner not found' }, { status: 404 });

  await prisma.vendor.update({
    where: { id: vendorId },
    data: { status },
  });

  await logAudit({
    actorId: guarded.user.id,
    actorEmail: guarded.user.email,
    actorRole: guarded.user.role,
    action: ACTION_BY_STATUS[status] ?? 'owners.update',
    resource: 'vendor',
    resourceId: vendorId,
    oldValues: { status: existing.status },
    newValues: { status },
  });

  return NextResponse.json({ ok: true });
}
