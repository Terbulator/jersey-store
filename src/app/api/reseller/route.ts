import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getResellerUser } from '@/lib/reseller-guard';
export const dynamic = 'force-dynamic';

export async function GET() {
  const guarded = await getResellerUser();
  if (!guarded.ok) return guarded.error;
  const { reseller } = guarded;

  const [sales, orders, payouts] = await Promise.all([
    prisma.resellerSale.findMany({
      where: { resellerId: reseller.id },
      include: { order: { select: { orderNumber: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where: { resellerId: reseller.id } }),
    prisma.resellerPayoutRequest.findMany({
      where: { resellerId: reseller.id },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const earned = sales.reduce((a, s) => a + Number(s.commissionEarned), 0);
  const paid = sales.filter((s) => s.status === 'PAID').reduce((a, s) => a + Number(s.commissionEarned), 0);

  const summary = {
    referralCode: reseller.referralCode,
    commissionRate: reseller.commissionRate,
    priceFloor: Number(reseller.priceFloor),
    priceCeiling: reseller.priceCeiling ? Number(reseller.priceCeiling) : null,
    tier: reseller.tier,
    status: reseller.status,
    orders,
    earned,
    pending: earned - paid,
    paid,
    referralLink: `/products?ref=${encodeURIComponent(reseller.referralCode)}`,
    sales: sales.slice(0, 50).map((s) => ({
      id: s.id,
      orderNumber: s.order.orderNumber,
      commission: Number(s.commissionEarned),
      status: s.status,
      createdAt: s.createdAt,
    })),
    payouts: payouts.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      status: p.status,
      note: p.note,
      createdAt: p.createdAt,
    })),
  };

  return NextResponse.json({ summary });
}
