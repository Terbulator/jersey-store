import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { hexOrToken, isSafeUrl } from './section-schemas';

// Header + footer configuration (site_settings keys 'header' / 'footer').
// Components merge these over built-in fallbacks, so an untouched config
// renders exactly today's chrome.

const optStr = (n: number) => z.string().max(n);
const optUrl = z.string().max(2000).refine((v) => isSafeUrl(v), { message: 'URL scheme not allowed.' });

export const headerSchema = z.object({
  logo: optUrl.optional(),
  logo_text: optStr(60).optional(),
  logo_size: z.coerce.number().min(16).max(64).optional(),
  tagline: optStr(60).optional(),
  sticky: z.boolean().optional(),
  transparent_top: z.boolean().optional(),
  bg: hexOrToken.optional(),
  link_color: hexOrToken.optional(),
  nav_gap: z.coerce.number().min(0).max(64).optional(),
  show_search: z.boolean().optional(),
  show_account: z.boolean().optional(),
  show_cart: z.boolean().optional(),
  show_wishlist: z.boolean().optional(),
}).strict();

export const footerSchema = z.object({
  logo_text: optStr(60).optional(),
  description: optStr(500).optional(),
  copyright: optStr(200).optional(),
  bg: hexOrToken.optional(),
  show_wordmark: z.boolean().optional(),
  legal: z.array(
    z.object({
      label: optStr(80),
      href: z.string().max(2000).refine((v) => isSafeUrl(v), { message: 'URL scheme not allowed.' }),
    })
  ).max(8).optional(),
}).strict();

export const HEADER_DEFAULTS = {
  logo: '',
  logo_text: 'HEADERR.',
  logo_size: 22,
  tagline: 'EST. 2026',
  sticky: true,
  transparent_top: true,
  bg: '',
  link_color: '',
  nav_gap: 32,
  show_search: true,
  show_account: true,
  show_cart: true,
  show_wishlist: true,
};

export const FOOTER_DEFAULTS = {
  logo_text: 'HEADERR.',
  description: '',
  copyright: '© 2026 HEADERR',
  bg: '',
  show_wordmark: true,
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Shipping Policy', href: '#' },
    { label: 'Refund Policy', href: '#' },
  ],
};

export type HeaderSettings = typeof HEADER_DEFAULTS;
export type FooterSettings = typeof FOOTER_DEFAULTS;

export function merge<T extends Record<string, unknown>>(defaults: T, raw: unknown): T {
  if (!raw || typeof raw !== 'object') return { ...defaults };
  const out = { ...defaults };
  for (const [k, dv] of Object.entries(defaults)) {
    const v = (raw as Record<string, unknown>)[k];
    if (v === undefined) continue;
    if (typeof dv === 'boolean' && typeof v === 'boolean') (out as Record<string, unknown>)[k] = v;
    else if (typeof dv === 'number' && typeof v === 'number') (out as Record<string, unknown>)[k] = v;
    else if (typeof dv === 'string' && typeof v === 'string') (out as Record<string, unknown>)[k] = v;
    else if (Array.isArray(dv) && Array.isArray(v)) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

export async function getSiteChrome(sb: SupabaseClient): Promise<{ header: HeaderSettings; footer: FooterSettings }> {
  const { data } = await sb.from('site_settings').select('key, value').in('key', ['header', 'footer']);
  const map: Record<string, unknown> = {};
  for (const row of data ?? []) map[row.key] = (row as { value?: unknown }).value;
  return { header: merge(HEADER_DEFAULTS, map.header), footer: merge(FOOTER_DEFAULTS, map.footer) };
}
