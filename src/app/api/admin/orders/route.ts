import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin-guard';
import { logAudit } from '@/lib/audit';
import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  const status = req.nextUrl.searchParams.get('status') ?? '';
  const search = req.nextUrl.searchParams.get('search') ?? '';
  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(req.nextUrl.searchParams.get('size') ?? '20', 10);

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status as OrderStatus;
  if (search) where.orderNumber = { contains: search, mode: 'insensitive' };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
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
    total: Number(o.total),
    status: o.status,
    paymentStatus: o.paymentStatus,
    customer: o.user?.name ?? 'Guest',
    email: o.user?.email,
    itemCount: o._count.items,
    createdAt: o.createdAt,
  }));

  return NextResponse.json({ orders: mapped, total, page, pageSize });
}

export async function PATCH(req: NextRequest) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  const body = await req.json();
  const { orderId, status, paymentStatus } = body;

  if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });

  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (status && Object.values(OrderStatus).includes(status)) data.status = status;
  if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus)) data.paymentStatus = paymentStatus;
  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  const updated = await prisma.order.update({ where: { id: orderId }, data });

  await logAudit({
    actorId: guarded.user.id,
    actorEmail: guarded.user.email,
    actorRole: guarded.user.role,
    action: data.status ? 'order.update_status' : 'order.update_payment',
    resource: 'order',
    resourceId: orderId,
    oldValues: { status: existing.status, paymentStatus: existing.paymentStatus },
    newValues: { status: updated.status, paymentStatus: updated.paymentStatus },
  });

  return NextResponse.json({ ok: true });
}
