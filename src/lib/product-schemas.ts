import { z } from 'zod';
import { isSafeUrl } from '@/lib/section-schemas';

// Shared product validation for create + update. Supabase column names are
// used verbatim (price, compare_price, shipping_note, …).

const safeUrlOrEmpty = z.string().max(2000).refine((v) => v === '' || isSafeUrl(v), {
  message: 'URL scheme not allowed.',
});

export const productFields = {
  slug: z.string().regex(/^[a-z0-9-]+$/, { message: 'Slug: lowercase letters, numbers, hyphens.' }).min(1).max(160),
  name: z.string().min(1).max(160),
  category: z.string().min(1).max(80),
  edition: z.string().min(1).max(80),
  team: z.string().max(80),
  season: z.string().max(80),
  badge: z.string().max(40),
  price: z.coerce.number().min(0).max(10_000_000),
  compare_price: z.coerce.number().min(0).max(10_000_000).nullable(),
  image: safeUrlOrEmpty,
  image_alt: z.string().max(200),
  images: z.array(z.string().max(2000).refine((v) => isSafeUrl(v), { message: 'URL scheme not allowed.' })).max(20),
  sizes: z.array(z.string().max(20)).max(20),
  description: z.string().max(5000),
  fit: z.string().max(2000),
  material: z.string().max(2000),
  care: z.string().max(2000),
  shipping_note: z.string().max(2000),
  returns_note: z.string().max(2000),
  seo_title: z.string().max(120),
  seo_description: z.string().max(300),
  og_image: safeUrlOrEmpty,
  featured: z.boolean(),
  published: z.boolean(),
};

export const productSchema = z.object({
  slug: productFields.slug,
  name: productFields.name,
  category: productFields.category,
  edition: productFields.edition,
  team: productFields.team.optional(),
  season: productFields.season.optional(),
  badge: productFields.badge.optional(),
  price: productFields.price,
  compare_price: productFields.compare_price.optional(),
  image: productFields.image.optional(),
  image_alt: productFields.image_alt.optional(),
  images: productFields.images.optional(),
  sizes: productFields.sizes.optional(),
  description: productFields.description.optional(),
  fit: productFields.fit.optional(),
  material: productFields.material.optional(),
  care: productFields.care.optional(),
  shipping_note: productFields.shipping_note.optional(),
  returns_note: productFields.returns_note.optional(),
  seo_title: productFields.seo_title.optional(),
  seo_description: productFields.seo_description.optional(),
  og_image: productFields.og_image.optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

export const productUpdateSchema = z.object({
  slug: productFields.slug.optional(),
  name: productFields.name.optional(),
  category: productFields.category.optional(),
  edition: productFields.edition.optional(),
  team: productFields.team.optional(),
  season: productFields.season.optional(),
  badge: productFields.badge.optional(),
  price: productFields.price.optional(),
  compare_price: productFields.compare_price.optional(),
  image: productFields.image.optional(),
  image_alt: productFields.image_alt.optional(),
  images: productFields.images.optional(),
  sizes: productFields.sizes.optional(),
  description: productFields.description.optional(),
  fit: productFields.fit.optional(),
  material: productFields.material.optional(),
  care: productFields.care.optional(),
  shipping_note: productFields.shipping_note.optional(),
  returns_note: productFields.returns_note.optional(),
  seo_title: productFields.seo_title.optional(),
  seo_description: productFields.seo_description.optional(),
  og_image: productFields.og_image.optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
}).strict();

export const variantSchema = z.object({
  product_id: z.string().min(1),
  size: z.string().min(1).max(20),
  color: z.string().max(40).optional(),
  sku: z.string().max(80).optional(),
  price: z.coerce.number().min(0).max(10_000_000).nullable().optional(),
  stock: z.coerce.number().int().min(0).max(1_000_000).optional(),
  low_stock_threshold: z.coerce.number().int().min(0).max(1_000_000).optional(),
});

export const variantUpdateSchema = z.object({
  size: z.string().min(1).max(20).optional(),
  color: z.string().max(40).nullable().optional(),
  sku: z.string().max(80).nullable().optional(),
  price: z.coerce.number().min(0).max(10_000_000).nullable().optional(),
  stock: z.coerce.number().int().min(0).max(1_000_000).optional(),
  low_stock_threshold: z.coerce.number().int().min(0).max(1_000_000).optional(),
}).strict();
