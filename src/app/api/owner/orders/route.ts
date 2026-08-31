import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, OrderStatus } from '@prisma/client';
import { getOwnerUser } from '@/lib/owner-guard';

export async function GET(req: NextRequest) {
  const guarded = await getOwnerUser();
  if (!guarded.ok) return guarded.error;
  const { vendor } = guarded;

  const status = req.nextUrl.searchParams.get('status') ?? '';
  const search = req.nextUrl.searchParams.get('search') ?? '';
  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(req.nextUrl.searchParams.get('size') ?? '20', 10);

  // distinct orders that contain this vendor's products
  const orderIds = await prisma.orderItem.findMany({
    where: { vendorId: vendor.id },
    select: { orderId: true },
    distinct: ['orderId'],
  });
  const where: Prisma.OrderWhereInput = {
    id: { in: orderIds.map((o) => o.orderId) },
  };
  if (status) where.status = status as OrderStatus;
  if (search) where.orderNumber = { contains: search, mode: 'insensitive' };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: {
          where: { vendorId: vendor.id },
          include: { product: { select: { name: true, slug: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  const mapped = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    customer: o.user?.name ?? 'Guest',
    email: o.user?.email,
    itemCount: o.items.length,
    items: o.items.map((it) => ({ name: it.product.name, qty: it.quantity, price: Number(it.price) })),
    total: Number(o.total),
    createdAt: o.createdAt,
  }));

  return NextResponse.json({ orders: mapped, total, page, pageSize });
}
