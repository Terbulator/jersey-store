// Pure helpers over storefront records. No static data — callers pass fetched arrays.
import type { Edition, Product } from '@/lib/storefront-types';

export const editionLabel = (editions: Edition[], id: string) =>
  editions.find((e) => e.slug === id)?.name ?? id;

export const formatSeason = (season: string) => {
  const n = parseInt(season, 10);
  if (Number.isNaN(n)) return season;
  return `${String(n).slice(2)}/${String(n + 1).slice(2)}`;
};

export const productsByCategory = (products: Product[], category: string) =>
  products.filter((p) => p.category === category);

export const productsByEdition = (products: Product[], edition: string) =>
  products.filter((p) => p.edition === edition);

export const bestSellers = (products: Product[], count = 8) => products.slice(0, count);

export const relatedProducts = (product: Product, products: Product[], count = 4) =>
  products
    .filter((p) => p.id !== product.id)
    .sort(
      (a, b) =>
        (a.category === product.category ? 1 : 0) -
        (b.category === product.category ? 1 : 0)
    )
    .slice(0, count);

export const metaLine = (p: Product, editions: Edition[]) =>
  `${editionLabel(editions, p.edition)?.toUpperCase()} · ${p.season ? formatSeason(p.season) : ''}`;