import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin-guard';
import { logAudit } from '@/lib/audit';
import { slugify } from '@/lib/utils';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;
  const user = guarded.user;

  const existing = await prisma.category.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

  const body = await req.json();
  const { name, description, parentId } = body;

  const updated = await prisma.category.update({
    where: { id: params.id },
    data: {
      ...(name ? { name, slug: slugify(name) } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(parentId !== undefined ? { parentId } : {}),
    },
  });

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'category.update',
    resource: 'category',
    resourceId: params.id,
    oldValues: { name: existing.name },
    newValues: { name: updated.name },
  });

  return NextResponse.json({ category: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;
  const user = guarded.user;

  const existing = await prisma.category.findUnique({
    where: { id: params.id },
    include: { _count: { select: { products: true } } },
  });
  if (!existing) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  if (existing._count.products > 0) {
    return NextResponse.json({ error: 'Cannot delete category with products' }, { status: 409 });
  }

  await prisma.category.delete({ where: { id: params.id } });

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'category.delete',
    resource: 'category',
    resourceId: params.id,
    oldValues: { name: existing.name },
  });

  return NextResponse.json({ ok: true });
}
