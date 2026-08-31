import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get('ids');
  if (!ids) {
    return NextResponse.json({ error: 'Missing ids param' }, { status: 400 });
  }

  const idList = ids.split(',').filter(Boolean);
  if (idList.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: idList }, published: true },
    include: {
      images: { orderBy: { position: 'asc' } },
      variants: true,
      category: true,
    },
  });

  const mapped = products.map((p) => {
    const primary = p.images.find((i) => i.isPrimary) ?? p.images[0];
    const inStock = p.variants.some((v) => v.stock > 0);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      basePrice: Number(p.basePrice),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
      image: primary?.url ?? '',
      team: p.team ?? '',
      season: p.season ?? '',
      player: p.player ?? undefined,
      category: p.category?.slug ?? '',
      categoryLabel: p.category?.name ?? '',
      inStock,
    };
  });

  return NextResponse.json({ products: mapped });
}
