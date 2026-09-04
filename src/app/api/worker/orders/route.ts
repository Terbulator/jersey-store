import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWorkerUser } from '@/lib/worker-guard';
export const dynamic = 'force-dynamic';

export async function GET() {
  const guarded = await getWorkerUser();
  if (!guarded.ok) return guarded.error;
  const { worker } = guarded;

  const taskOrders = await prisma.task.findMany({
    where: { workerId: worker.id, orderId: { not: null } },
    select: { orderId: true },
    distinct: ['orderId'],
  });
  const ids = taskOrders.map((t) => t.orderId).filter((id): id is string => !!id);

  const orders = ids.length
    ? await prisma.order.findMany({
        where: { id: { in: ids } },
        include: {
          items: { include: { product: { select: { name: true, slug: true } } } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const mapped = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    customer: o.user?.name ?? 'Guest',
    email: o.user?.email,
    items: o.items.map((it) => ({ name: it.product.name, qty: it.quantity, price: Number(it.price) })),
    total: Number(o.total),
    createdAt: o.createdAt,
  }));

  return NextResponse.json({ orders: mapped });
}
