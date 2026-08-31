import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOwnerUser } from '@/lib/owner-guard';

export async function GET() {
  try {
    const guarded = await getOwnerUser();
    if (!guarded.ok) return guarded.error;
    const { vendor } = guarded;

    const [productCount, publishedCount, workerCount, taskCount, pendingTasks, orderCount, revenue] =
      await Promise.all([
        prisma.product.count({ where: { vendorId: vendor.id } }),
        prisma.product.count({ where: { vendorId: vendor.id, published: true } }),
        prisma.worker.count({ where: { ownerId: guarded.user.id } }),
        prisma.task.count({ where: { worker: { ownerId: guarded.user.id } } }),
        prisma.task.count({ where: { worker: { ownerId: guarded.user.id }, status: 'PENDING' } }),
        prisma.orderItem.count({ where: { vendorId: vendor.id } }),
        // ponytail: revenue = sum of order item totals for this vendor
        prisma.orderItem.aggregate({ where: { vendorId: vendor.id }, _sum: { total: true } }),
      ]);

    const recentOrders = await prisma.orderItem.findMany({
      where: { vendorId: vendor.id },
      include: {
        order: { select: { id: true, orderNumber: true, status: true, createdAt: true } },
        product: { select: { name: true } },
      },
      orderBy: { order: { createdAt: 'desc' } },
      take: 5,
    });

    return NextResponse.json({
      productCount,
      publishedCount,
      workerCount,
      taskCount,
      pendingTasks,
      orderCount,
      revenue: revenue._sum.total ? Number(revenue._sum.total) : 0,
      recentOrders: recentOrders.map((oi) => ({
        id: oi.order.id,
        orderNumber: oi.order.orderNumber,
        status: oi.order.status,
        createdAt: oi.order.createdAt,
        product: oi.product.name,
        qty: oi.quantity,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
