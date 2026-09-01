import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWorkerUser } from '@/lib/worker-guard';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const guarded = await getWorkerUser();
  if (!guarded.ok) return guarded.error;

  const vendor = await prisma.vendor.findUnique({ where: { userId: guarded.worker.ownerId } });
  if (!vendor) return NextResponse.json({ error: 'No vendor found for your owner' }, { status: 404 });

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    include: { variants: true },
    orderBy: [{ team: 'asc' }, { name: 'asc' }],
  });

  const mapped = products.map((p) => ({
    id: p.id,
    name: p.name,
    team: p.team,
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      stock: v.stock,
    })),
  }));

  return NextResponse.json({ products: mapped });
}

export async function PATCH(req: NextRequest) {
  const guarded = await getWorkerUser();
  if (!guarded.ok) return guarded.error;
  const { user, worker } = guarded;

  const body = await req.json();
  const { variantId, stock } = body;
  if (!variantId || !Number.isInteger(stock) || stock < 0) {
    return NextResponse.json({ error: 'Invalid stock update' }, { status: 400 });
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: worker.ownerId } });
  if (!vendor) return NextResponse.json({ error: 'No vendor found' }, { status: 404 });

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId }, include: { product: true } });
  if (!variant || variant.product.vendorId !== vendor.id) {
    return NextResponse.json({ error: 'Variant not in your inventory' }, { status: 403 });
  }

  const updated = await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock },
  });

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'stock.update',
    resource: 'variant',
    resourceId: variantId,
    oldValues: { stock: variant.stock },
    newValues: { stock: updated.stock },
  });

  return NextResponse.json({ ok: true, stock: updated.stock });
}
