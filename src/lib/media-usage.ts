import type { SupabaseClient } from '@supabase/supabase-js';

export interface MediaUsage {
  location: string;
  detail: string;
}

// Finds every CMS reference to an asset URL so the library can warn
// ("This image is used in X places") and block accidental deletes.
export async function findMediaUsage(sb: SupabaseClient, url: string): Promise<MediaUsage[]> {
  const usage: MediaUsage[] = [];
  if (!url) return usage;

  const [sections, products, pages, settings, slides, banners, categories, collections] = await Promise.all([
    sb.from('homepage_sections').select('name, settings'),
    sb.from('products').select('slug, image, images, og_image'),
    sb.from('site_pages').select('slug, title, blocks'),
    sb.from('site_settings').select('key, value').in('key', ['header']),
    sb.from('promo_slides').select('headline, desktop_image, mobile_image'),
    sb.from('banners').select('name, image'),
    sb.from('categories').select('name, image'),
    sb.from('collections').select('name, image'),
  ]);

  for (const s of sections.data ?? []) {
    if (JSON.stringify((s as { settings?: unknown }).settings ?? {}).includes(url)) {
      usage.push({ location: 'Homepage', detail: String((s as { name?: string }).name ?? 'section') });
    }
  }
  for (const p of (products.data ?? []) as { slug?: string; image?: string | null; images?: unknown; og_image?: string | null }[]) {
    const imgs = Array.isArray(p.images) ? p.images : [];
    if (p.image === url || p.og_image === url || imgs.includes(url)) {
      usage.push({ location: 'Product', detail: String(p.slug ?? 'product') });
    }
  }
  for (const pg of (pages.data ?? []) as { slug?: string; title?: string; blocks?: unknown }[]) {
    if (JSON.stringify(pg.blocks ?? []).includes(url)) {
      usage.push({ location: 'Page', detail: `/${String(pg.slug ?? '')}` });
    }
  }
  for (const st of (settings.data ?? []) as { key?: string; value?: unknown }[]) {
    if (JSON.stringify(st.value ?? {}).includes(url)) {
      usage.push({ location: 'Site settings', detail: String(st.key ?? '') });
    }
  }
  for (const s of (slides.data ?? []) as { headline?: string | null; desktop_image?: string | null; mobile_image?: string | null }[]) {
    if (s.desktop_image === url || s.mobile_image === url) {
      usage.push({ location: 'Promo slide', detail: String(s.headline ?? 'slide') });
    }
  }
  for (const [rows, location] of [
    [banners.data, 'Banner'],
    [categories.data, 'Category'],
    [collections.data, 'Collection'],
  ] as const) {
    for (const r of (rows ?? []) as { name?: string | null; image?: string | null }[]) {
      if (r.image === url) usage.push({ location, detail: String(r.name ?? 'item') });
    }
  }
  return usage;
}
