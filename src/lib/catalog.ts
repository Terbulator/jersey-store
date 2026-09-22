import { EDITION_TYPES, PRODUCTS, type Product } from '@/data/products';

export const EDITION_LABEL: Record<string, string> = Object.fromEntries(
  EDITION_TYPES.map((e) => [e.id, e.name])
);

export const editionLabel = (edition: string) =>
  EDITION_LABEL[edition] ?? edition;

export const formatSeason = (season: string) => {
  const n = parseInt(season, 10);
  if (Number.isNaN(n)) return season;
  return `${String(n).slice(2)}/${String(n + 1).slice(2)}`;
};

export const productBySlug = (slug: string) =>
  PRODUCTS.find((p) => p.slug === slug);

export const productsByCategory = (category: string) =>
  PRODUCTS.filter((p) => p.category === category);

export const productsByEdition = (edition: string) =>
  PRODUCTS.filter((p) => p.edition === edition);

export const bestSellers = () => PRODUCTS.slice(0, 8);

export const relatedProducts = (product: Product, count = 4) =>
  PRODUCTS.filter((p) => p.id !== product.id)
    .sort((a, b) =>
      (a.badge === product.badge || a.category === product.category ? 1 : 0) -
      (b.badge === product.badge || b.category === product.category ? 1 : 0)
    )
    .slice(0, count);

export const metaLine = (p: Product) =>
  `${EDITION_LABEL[p.edition]?.toUpperCase()} · ${formatSeason(p.season)}`;