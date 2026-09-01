import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getResellerUser } from '@/lib/reseller-guard';

export async function GET(req: NextRequest) {
  const guarded = await getResellerUser();
  if (!guarded.ok) return guarded.error;
  const { reseller } = guarded;

  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10);
  const pageSize = 20;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { resellerId: reseller.id },
      include: {
        items: { select: { product: { select: { name: true } }, quantity: true, total: true } },
        coupon: { select: { code: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where: { resellerId: reseller.id } }),
  ]);

  const mapped = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    subtotal: Number(o.subtotal),
    total: Number(o.total),
    coupon: o.coupon?.code ?? null,
    createdAt: o.createdAt,
    products: o.items.map((i) => ({ name: i.product.name, quantity: i.quantity, total: Number(i.total) })),
  }));

  return NextResponse.json({ orders: mapped, total, page, pageSize });
}
