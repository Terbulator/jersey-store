import { prisma } from '@/lib/prisma';

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  comparePrice?: number;
  image: string;
  gallery: string[];
  team: string;
  season: string;
  player?: string;
  brand?: string;
  category: string;
  categoryLabel: string;
  featured?: boolean;
  inStock: boolean;
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const CATEGORIES = [
  {
    slug: 'retro',
    title: 'Retro Classics',
    description: 'Iconic jerseys from 1990–2015',
    accent: 'from-red-500/80 to-orange-500/80',
    image: img('photo-1517466787929-bc90951d0974'),
  },
  {
    slug: 'current',
    title: 'Current Season',
    description: '2024/25 official kits',
    accent: 'from-blue-500/80 to-cyan-500/80',
    image: img('photo-1552346154-21d32810aba3'),
  },
  {
    slug: 'world-cup',
    title: 'World Cup 2026',
    description: 'National team collection',
    accent: 'from-emerald-500/80 to-green-500/80',
    image: img('photo-1522778119026-d647f0596c20'),
  },
] as const;

function mapProduct(p: {
  id: string;
  slug: string;
  name: string;
  description: string;
  basePrice: { toString(): string } | number;
  comparePrice?: { toString(): string } | number | null;
  team: string | null;
  season: string | null;
  player: string | null;
  brand: string | null;
  featured: boolean;
  images: { url: string; isPrimary: boolean }[];
  variants: { stock: number }[];
  category: { slug: string; name: string } | null;
}): Product {
  const images = p.images ?? [];
  const primary = images.find((i) => i.isPrimary) ?? images[0];
  const variants = p.variants ?? [];
  const inStock = variants.some((v) => v.stock > 0);
  const toNum = (v: { toString(): string } | number) => Number(v);

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    basePrice: toNum(p.basePrice),
    comparePrice: p.comparePrice ? toNum(p.comparePrice) : undefined,
    image: primary?.url ?? '',
    gallery: images.map((i) => i.url),
    team: p.team ?? '',
    season: p.season ?? '',
    player: p.player ?? undefined,
    brand: p.brand ?? undefined,
    category: p.category?.slug ?? '',
    categoryLabel: p.category?.name ?? '',
    featured: p.featured,
    inStock,
  };
}

const productInclude = {
  images: { orderBy: { position: 'asc' as const } },
  variants: true,
  category: true,
};

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { published: true, featured: true },
    include: productInclude,
    take: 8,
  });
  return products.map(mapProduct);
}

export async function getAllProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { published: true },
    include: productInclude,
  });
  return products.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
  return product ? mapProduct(product) : null;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { published: true, category: { slug: categorySlug } },
    include: productInclude,
  });
  return products.map(mapProduct);
}

export async function getRelatedProducts(slug: string, categorySlug: string, limit = 4): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { published: true, category: { slug: categorySlug }, slug: { not: slug } },
    include: productInclude,
    take: limit,
  });
  return products.map(mapProduct);
}
