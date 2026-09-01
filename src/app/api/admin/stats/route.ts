import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin-guard';

export async function GET() {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  try {
    const [
      userCount,
      ownerCount,
      workerCount,
      productCount,
      orderCount,
      revenue,
      auditCount,
      openTicketCount,
      pendingResellerCount,
      activeCouponCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'OWNER' } }),
      prisma.worker.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.auditLog.count(),
      prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.reseller.count({ where: { status: 'PENDING' } }),
      prisma.coupon.count({ where: { active: true } }),
    ]);

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
