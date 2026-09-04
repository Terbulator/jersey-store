import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin-guard';
import { logAudit } from '@/lib/audit';
import { slugify } from '@/lib/utils';
export const dynamic = 'force-dynamic';

export async function GET() {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  const body = await req.json();
  const { name, description, parentId } = body;

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  try {
    const category = await prisma.category.create({
      data: {
        name,
        slug: slugify(name),
        description: description ?? null,
        parentId: parentId ?? null,
      },
    });

    await logAudit({
      actorId: guarded.user.id,
      actorEmail: guarded.user.email,
      actorRole: guarded.user.role,
      action: 'category.create',
      resource: 'category',
      resourceId: category.id,
      newValues: { name },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Category with this name may already exist' }, { status: 409 });
  }
}
