import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getAdminUser } from '@/lib/admin-guard';
import { logAudit } from '@/lib/audit';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  const search = req.nextUrl.searchParams.get('search') ?? '';
  const categoryId = req.nextUrl.searchParams.get('category') ?? '';
  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(req.nextUrl.searchParams.get('size') ?? '20', 10);

  const where: Prisma.ProductWhereInput = {};
  if (categoryId) where.categoryId = categoryId;
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        vendor: { select: { storeName: true } },
        images: { take: 1 },
        _count: { select: { variants: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const mapped = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: Number(p.basePrice),
    published: p.published,
    featured: p.featured,
    category: p.category.name,
    store: p.vendor?.storeName,
    image: p.images[0]?.url,
    variantCount: p._count.variants,
  }));

  return NextResponse.json({ products: mapped, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  const body = await req.json();
  const {
    name, categoryId, vendorId, description, basePrice, comparePrice,
    team, season, player, brand, published, featured,
  } = body;

  if (!name || !categoryId || !vendorId || !basePrice) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const slug = slugify(name + '-' + Date.now().toString(36));
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId,
        vendorId,
        description: description ?? '',
        basePrice,
        comparePrice: comparePrice ?? null,
        team: team ?? null,
        season: season ?? null,
        player: player ?? null,
        brand: brand ?? null,
        published: published ?? false,
        featured: featured ?? false,
      },
    });

    await logAudit({
      actorId: guarded.user.id,
      actorEmail: guarded.user.email,
      actorRole: guarded.user.role,
      action: 'product.create',
      resource: 'product',
      resourceId: product.id,
      newValues: { name, basePrice },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
