import { z } from 'zod';
import { isSafeUrl } from './section-schemas';

// CMS content pages (site_pages). Public URLs are /<slug>; slugs colliding
// with real routes are reserved so a CMS page can never shadow the shop,
// checkout, admin, or auth flows.

export const RESERVED_SLUGS = [
  'about', 'culture', 'bundle', 'subscribe', 'search', 'wishlist', 'cart',
  'checkout', 'account', 'admin', 'api', 'shop', 'owner', 'worker', 'reseller',
  'login', 'signup', 'forgot-password', 'p', 'pages', 'theme-editor',
];

const optStr = (n: number) => z.string().max(n);

export const blockSchema = z.object({
  id: z.string().max(50),
  type: z.enum(['heading', 'text', 'image', 'button', 'divider']),
  text: optStr(2000).optional(),
  size: z.enum(['sm', 'md', 'lg']).optional(),
  url: z.string().max(2000).refine((v) => isSafeUrl(v), { message: 'URL scheme not allowed.' }).optional(),
  alt: optStr(200).optional(),
  caption: optStr(300).optional(),
  destination: z.string().max(2000).refine((v) => isSafeUrl(v), { message: 'URL scheme not allowed.' }).optional(),
});

export const pageSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z.string().regex(/^[a-z0-9-]{1,80}$/, { message: 'Slug: lowercase letters, numbers, hyphens.' }),
  blocks: z.array(blockSchema).max(50),
  published: z.boolean(),
  seo_title: optStr(120).optional(),
  seo_description: optStr(300).optional(),
});

export type PageBlocks = z.infer<typeof blockSchema>[];

export function validatePageSlug(slug: string): string | null {
  if (RESERVED_SLUGS.includes(slug)) return 'That URL is reserved by the store — pick another.';
  return null;
}
