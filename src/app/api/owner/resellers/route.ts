import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOwnerUser } from '@/lib/owner-guard';
import { logAudit } from '@/lib/audit';
import { ResellerStatus } from '@/generated/prisma/client';
export const dynamic = 'force-dynamic';

export async function GET() {
  const guarded = await getOwnerUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const vendor = await prisma.vendor.findUnique({ where: { userId: user.id } });
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

  const resellerIds = await prisma.resellerSale.findMany({
    where: { order: { items: { some: { vendorId: vendor.id } } } },
    select: { resellerId: true },
    distinct: ['resellerId'],
  });
  const ids = resellerIds.map((r) => r.resellerId);

  const resellers = await prisma.reseller.findMany({
    where: { id: { in: ids } },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { sales: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const earnings = await prisma.resellerSale.groupBy({
    by: ['resellerId'],
    where: { orderId: { in: (await prisma.order.findMany({ where: { items: { some: { vendorId: vendor.id } } }, select: { id: true } })).map((o) => o.id) } },
    _sum: { commissionEarned: true },
  });
  const earnedMap = new Map(earnings.map((e) => [e.resellerId, Number(e._sum.commissionEarned ?? 0)]));

  const mapped = resellers.map((r) => ({
    id: r.id,
    email: r.user.email,
    name: r.user.name,
    referralCode: r.referralCode,
    commissionRate: r.commissionRate,
    priceFloor: Number(r.priceFloor),
    priceCeiling: r.priceCeiling ? Number(r.priceCeiling) : null,
    tier: r.tier,
    status: r.status,
    salesCount: r._count.sales,
    earned: earnedMap.get(r.id) ?? 0,
    createdAt: r.createdAt,
  }));

  return NextResponse.json({ resellers: mapped });
}

export async function PATCH(req: NextRequest) {
  const guarded = await getOwnerUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const vendor = await prisma.vendor.findUnique({ where: { userId: user.id } });
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

  const body = await req.json();
  const { resellerId, status, commissionRate, priceFloor, priceCeiling, tier } = body;
  if (!resellerId) return NextResponse.json({ error: 'Missing resellerId' }, { status: 400 });

  const existing = await prisma.reseller.findUnique({ where: { id: resellerId } });
  if (!existing) return NextResponse.json({ error: 'Reseller not found' }, { status: 404 });

  const hasAccess = await prisma.resellerSale.findFirst({
    where: { resellerId, order: { items: { some: { vendorId: vendor.id } } } },
  });
  if (!hasAccess) return NextResponse.json({ error: 'Reseller not associated with your store' }, { status: 403 });

  const data: Record<string, unknown> = {};
  if (status && Object.values(ResellerStatus).includes(status)) data.status = status;
  if (typeof commissionRate === 'number') data.commissionRate = commissionRate;
  if (typeof priceFloor === 'number') data.priceFloor = priceFloor;
  if (priceCeiling !== undefined) data.priceCeiling = priceCeiling === null ? null : Number(priceCeiling);
  if (tier) data.tier = tier;
  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  const updated = await prisma.reseller.update({ where: { id: resellerId }, data });

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'reseller.update',
    resource: 'reseller',
    resourceId: resellerId,
    oldValues: { status: existing.status, commissionRate: existing.commissionRate },
    newValues: { status: updated.status, commissionRate: updated.commissionRate },
  });

  return NextResponse.json({ ok: true });
}
