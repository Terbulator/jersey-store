import { PrismaClient, OrderStatus, PaymentStatus, Role, TaskPriority } from '@prisma/client';
import { generateOrderNumber } from '../src/lib/utils';

const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.user.findUnique({ where: { email: 'haldararitra40@gmail.com' } });
  const admin = await prisma.user.findUnique({ where: { email: 'headerr0001@gmail.com' } });
  const owner = await prisma.user.findUnique({ where: { email: 'owner@example.com' } });
  const vendor = await prisma.vendor.findFirst({ orderBy: { createdAt: 'asc' } });
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } });

  if (!customer || !admin || !owner || !vendor || products.length === 0) {
    throw new Error('Base seed not complete — run db:seed first.');
  }

  const variants = await prisma.productVariant.findMany({
    where: { productId: { in: products.map((p) => p.id) }, color: 'Home Red' },
    orderBy: { productId: 'asc' },
  });
  const variantByProduct = (pid: string) => variants.find((v) => v.productId === pid) ?? variants[0]!;

  // ============ Coupons (idempotent by code) ============
  const coupons = [
    { code: 'WELCOME10', percentOff: 10, maxDiscount: 100, minSubtotal: 500, maxUses: 100, expiresAt: null },
    { code: 'JERSEY15', percentOff: 15, maxDiscount: 150, minSubtotal: 800, maxUses: 50, expiresAt: new Date(Date.now() + 30 * 864e5) },
  ];
  const couponIds: Record<string, string> = {};
  for (const c of coupons) {
    const exists = await prisma.coupon.findUnique({ where: { code: c.code } });
    if (exists) { couponIds[c.code] = exists.id; continue; }
    const created = await prisma.coupon.create({
      data: { code: c.code, description: `Demo coupon: ${c.percentOff}% off`, percentOff: c.percentOff, maxDiscount: c.maxDiscount, minSubtotal: c.minSubtotal, maxUses: c.maxUses, active: true, expiresAt: c.expiresAt },
    });
    couponIds[c.code] = created.id;
  }

  // ============ Reseller (idempotent by referralCode) ============
  let reseller = await prisma.reseller.findUnique({ where: { referralCode: 'DEMORSLR' } });
  if (!reseller) {
    const ru = await prisma.user.create({
      data: { email: 'reseller@example.com', name: 'Demo Reseller', role: Role.CUSTOMER },
    });
    reseller = await prisma.reseller.create({
      data: { userId: ru.id, referralCode: 'DEMORSLR', commissionRate: 0.1, priceFloor: 400, priceCeiling: 700, status: 'APPROVED', tier: 'Bronze' },
    });
  }

  // ============ Orders (idempotent by orderNumber) ============
  const orderSeed = [
    { status: OrderStatus.DELIVERED, paymentStatus: PaymentStatus.PAID, productIdx: 0, qty: 1, daysAgo: 20, coupon: 'WELCOME10', reseller: false },
    { status: OrderStatus.SHIPPED, paymentStatus: PaymentStatus.PAID, productIdx: 1, qty: 2, daysAgo: 6, coupon: null, reseller: false },
    { status: OrderStatus.PROCESSING, paymentStatus: PaymentStatus.PAID, productIdx: 3, qty: 1, daysAgo: 2, coupon: 'JERSEY15', reseller: true },
    { status: OrderStatus.PENDING, paymentStatus: PaymentStatus.PENDING, productIdx: 2, qty: 1, daysAgo: 0, coupon: null, reseller: false },
  ];

  const createdAtBase = Date.now();
  for (const s of orderSeed) {
    const product = products[s.productIdx];
    const variant = variantByProduct(product.id);
    const base = Number(product.basePrice);
    const subtotal = base * s.qty;
    const shipping = 0;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + shipping + tax;
    let orderNumber = generateOrderNumber();

    // ensure unique order number across re-runs
    while (await prisma.order.findUnique({ where: { orderNumber } })) orderNumber = generateOrderNumber();

    let rsl: string | null = s.reseller ? reseller.id : null;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: customer.id,
        status: s.status,
        paymentStatus: s.paymentStatus,
        couponId: s.coupon ? couponIds[s.coupon] : null,
        resellerId: rsl,
        discount: 0,
        subtotal,
        shipping,
        tax,
        total,
        createdAt: new Date(createdAtBase - s.daysAgo * 864e5),
        items: {
          create: {
            productId: product.id,
            variantId: variant.id,
            vendorId: vendor.id,
            quantity: s.qty,
            price: base,
            total: subtotal,
          },
        },
      },
    });

    if (s.reseller) {
      await prisma.resellerSale.create({
        data: { resellerId: reseller.id, orderId: order.id, commissionEarned: Math.round(total * 0.1 * 100) / 100, status: 'PENDING' },
      });
    }
  }

  // ============ Payout request (idempotent) ============
  const payoutCount = await prisma.resellerPayoutRequest.count({ where: { resellerId: reseller.id } });
  if (payoutCount === 0) {
    await prisma.resellerPayoutRequest.create({
      data: { resellerId: reseller.id, amount: 0, status: 'PENDING', note: 'Demo payout request' },
    });
  }

  // ============ Tickets (only if none exist) ============
  const worker = await prisma.worker.findFirst();
  if (await prisma.ticket.count() === 0) {
    await prisma.ticket.createMany({
      data: [
        { subject: 'Order status question', message: 'When will my jersey ship?', status: 'OPEN', priority: TaskPriority.MEDIUM, customerId: customer.id },
        { subject: 'Wrong size received', message: 'I ordered an L but got an M.', status: 'IN_PROGRESS', priority: TaskPriority.HIGH, customerId: customer.id, workerId: worker?.id ?? undefined },
      ],
    });
  }

  // ============ Audit log (only if none exist) ============
  if (await prisma.auditLog.count() === 0) {
    await prisma.auditLog.createMany({
      data: [
        { actorId: admin.id, actorEmail: admin.email, actorRole: Role.ADMIN, action: 'settings.update', resource: 'setting', result: 'success', newValues: { siteName: 'Jersey Store' } },
        { actorId: admin.id, actorEmail: admin.email, actorRole: Role.ADMIN, action: 'product.create', resource: 'product', result: 'success' },
        { actorId: owner.id, actorEmail: owner.email, actorRole: Role.OWNER, action: 'permission.override', resource: 'permission', result: 'success' },
      ],
    });
  }

  console.log('✅ Demo data seeded:', JSON.stringify({
    orders: await prisma.order.count(),
    coupons: await prisma.coupon.count(),
    resellers: await prisma.reseller.count(),
    payouts: await prisma.resellerPayoutRequest.count(),
    tickets: await prisma.ticket.count(),
    audit: await prisma.auditLog.count(),
  }));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
