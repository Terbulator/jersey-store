import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin-guard';
export const dynamic = 'force-dynamic';

export async function GET() {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  try {
    const userCount = await prisma.user.count();
    const ownerCount = await prisma.user.count({ where: { role: 'OWNER' } });
    const workerCount = await prisma.worker.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    const revenue = await prisma.order.aggregate({ _sum: { total: true } });
    const auditCount = await prisma.auditLog.count();
    const openTicketCount = await prisma.ticket.count({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
    });
    const pendingResellerCount = await prisma.reseller.count({ where: { status: 'PENDING' } });
    const activeCouponCount = await prisma.coupon.count({ where: { active: true } });

    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json({
      userCount,
      ownerCount,
      workerCount,
      productCount,
      orderCount,
      revenue: revenue._sum.total ? Number(revenue._sum.total) : 0,
      auditCount,
      openTicketCount,
      pendingResellerCount,
      activeCouponCount,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: Number(o.total),
        status: o.status,
        customer: o.user?.name ?? 'Guest',
        createdAt: o.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
