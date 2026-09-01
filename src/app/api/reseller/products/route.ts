import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { getResellerUser } from '@/lib/reseller-guard';

export async function GET(req: NextRequest) {
  const guarded = await getResellerUser();
  if (!guarded.ok) return guarded.error;
  const { reseller } = guarded;

  const search = req.nextUrl.searchParams.get('search') ?? '';
  const where: Prisma.ProductWhereInput = { published: true };
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      images: { take: 1 },
      _count: { select: { variants: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const mapped = products.map((p) => {
    const base = Number(p.basePrice);
    return {
      id: p.id,
      name: p.name,
      basePrice: base,
      resePrice: Math.min(Math.max(Math.ceil(base * (1 + reseller.commissionRate)), Number(reseller.priceFloor)), reseller.priceCeiling ? Number(reseller.priceCeiling) : Number.MAX_SAFE_INTEGER),
      category: p.category.name,
      team: p.team ?? '',
      image: p.images[0]?.url ?? '',
    };
  });

  return NextResponse.json({
    products: mapped,
    priceFloor: Number(reseller.priceFloor),
    priceCeiling: reseller.priceCeiling ? Number(reseller.priceCeiling) : null,
    commissionRate: reseller.commissionRate,
  });
}
