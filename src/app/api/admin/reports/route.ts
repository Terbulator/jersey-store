import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin-guard';

export async function GET(req: NextRequest) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  const days = Math.min(parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10) || 30, 365);
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const [sales, orders, products, customers, traffic] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: since } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: since } } }),
    prisma.product.count({ where: { published: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      _sum: { total: true },
    }),
  ]);

  const revenue = sales._sum.total ? Number(sales._sum.total) : 0;
  const aov = orders > 0 ? revenue / orders : 0;

  const dailyMap = new Map<string, { orders: number; revenue: number }>();
  traffic.forEach((t) => {
    const key = t.createdAt.toISOString().slice(0, 10);
    const cur = dailyMap.get(key) ?? { orders: 0, revenue: 0 };
    cur.orders += t._count._all;
    cur.revenue += t._sum.total ? Number(t._sum.total) : 0;
    dailyMap.set(key, cur);
  });

  const daily = Array.from({ length: days }, (_, i) => {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const cur = dailyMap.get(key) ?? { orders: 0, revenue: 0 };
    return { date: key.split('-').reverse().join('/'), orders: cur.orders, revenue: cur.revenue };
  });

  return NextResponse.json({
    days,
    revenue,
    orders,
    aov,
    products,
    customers,
    daily,
  });
}
