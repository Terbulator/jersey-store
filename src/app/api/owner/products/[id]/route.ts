import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getOwnerUser } from '@/lib/owner-guard';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guarded = await getOwnerUser();
  if (!guarded.ok) return guarded.error;
  const { vendor, user } = guarded;

  const existing = await prisma.product.findFirst({ where: { id: params.id, vendorId: vendor.id } });
  if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const body = await req.json();
  const data: Prisma.ProductUpdateInput = {};
  for (const field of ['name', 'description', 'basePrice', 'comparePrice', 'team', 'season', 'player', 'brand', 'published', 'featured', 'categoryId'] as const) {
    if (body[field] !== undefined) {
      if (field === 'basePrice' || field === 'comparePrice') {
        (data as Record<string, unknown>)[field] = body[field] ? Number(body[field]) : null;
      } else {
        (data as Record<string, unknown>)[field] = body[field];
      }
    }
  }
  if (data.name && typeof data.name === 'string') {
    (data as { slug?: string }).slug = data.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') + '-' + Date.now().toString(36);
  }
  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  const updated = await prisma.product.update({ where: { id: params.id }, data });

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'product.update',
    resource: 'product',
    resourceId: params.id,
    oldValues: { name: existing.name },
    newValues: { name: updated.name },
  });

  return NextResponse.json({ product: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const guarded = await getOwnerUser();
  if (!guarded.ok) return guarded.error;
  const { vendor, user } = guarded;

  const existing = await prisma.product.findFirst({ where: { id: params.id, vendorId: vendor.id } });
  if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  await prisma.product.delete({ where: { id: params.id } });

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'product.delete',
    resource: 'product',
    resourceId: params.id,
    oldValues: { name: existing.name },
  });

  return NextResponse.json({ ok: true });
}
