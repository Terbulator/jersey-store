import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin-guard';
import { logAudit } from '@/lib/audit';
import { ResellerStatus } from '@/generated/prisma/client';

export async function GET() {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  const resellers = await prisma.reseller.findMany({
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { sales: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const earnings = await prisma.resellerSale.groupBy({
    by: ['resellerId'],
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
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const body = await req.json();
  const { resellerId, status, commissionRate, priceFloor, priceCeiling, tier } = body;
  if (!resellerId) return NextResponse.json({ error: 'Missing resellerId' }, { status: 400 });

  const existing = await prisma.reseller.findUnique({ where: { id: resellerId } });
  if (!existing) return NextResponse.json({ error: 'Reseller not found' }, { status: 404 });

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
