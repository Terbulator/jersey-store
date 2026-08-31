import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin-guard';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await getAdminUser();
  if (error) return error;

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      vendor: { select: { id: true, storeName: true } },
      images: { orderBy: { position: 'asc' } },
      variants: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  return NextResponse.json({
    ...product,
    basePrice: Number(product.basePrice),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    variants: product.variants.map((v) => ({ ...v, price: Number(v.price) })),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;
  const user = guarded.user;

  const existing = await prisma.product.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const body = await req.json();
  const { name, categoryId, description, basePrice, comparePrice, team, season, player, brand, published, featured } = body;

  const updated = await prisma.product.update({
    where: { id: params.id },
    data: {
      ...(name ? { name } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(basePrice !== undefined ? { basePrice } : {}),
      ...(comparePrice !== undefined ? { comparePrice } : {}),
      ...(team !== undefined ? { team } : {}),
      ...(season !== undefined ? { season } : {}),
      ...(player !== undefined ? { player } : {}),
      ...(brand !== undefined ? { brand } : {}),
      ...(published !== undefined ? { published } : {}),
      ...(featured !== undefined ? { featured } : {}),
    },
  });

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'product.update',
    resource: 'product',
    resourceId: params.id,
    oldValues: { name: existing.name, published: existing.published },
    newValues: { name: updated.name, published: updated.published },
  });

  return NextResponse.json({ product: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;
  const user = guarded.user;

  const existing = await prisma.product.findUnique({ where: { id: params.id } });
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
    result: 'success',
  });

  return NextResponse.json({ ok: true });
}
