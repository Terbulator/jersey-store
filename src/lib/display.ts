import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';

// Product / collection display templates (site_settings key 'templates').
// One change here restyles every product card, product page, or collection
// grid at once — templates, not per-product overrides.

const cardSchema = z.object({
  image_ratio: z.enum(['3/4', '1/1', '4/5']).optional(),
  show_second_image: z.boolean().optional(),
  show_wishlist: z.boolean().optional(),
  show_quick_add: z.boolean().optional(),
  show_compare: z.boolean().optional(),
  show_description: z.boolean().optional(),
  radius: z.coerce.number().min(0).max(32).optional(),
  badge_style: z.enum(['pill', 'square']).optional(),
}).strict();

const detailSchema = z.object({
  thumbs_position: z.enum(['below', 'side']).optional(),
  show_quantity: z.boolean().optional(),
  show_buy_now: z.boolean().optional(),
  show_shipping: z.boolean().optional(),
  show_trust: z.boolean().optional(),
  show_accordions: z.boolean().optional(),
  related_count: z.coerce.number().min(0).max(8).optional(),
  related_title: z.string().max(120).optional(),
}).strict();

const collectionSchema = z.object({
  columns_desktop: z.coerce.number().min(2).max(4).optional(),
  columns_mobile: z.coerce.number().min(1).max(2).optional(),
  show_count: z.boolean().optional(),
  show_filters: z.boolean().optional(),
  show_sort: z.boolean().optional(),
}).strict();

export const templateSchema = z.object({
  card: cardSchema.optional(),
  detail: detailSchema.optional(),
  collection: collectionSchema.optional(),
}).strict();

export const DISPLAY_DEFAULTS = {
  card: {
    image_ratio: '3/4',
    show_second_image: true,
    show_wishlist: true,
    show_quick_add: true,
    show_compare: true,
    show_description: true,
    radius: 0,
    badge_style: 'pill',
  },
  detail: {
    thumbs_position: 'below',
    show_quantity: true,
    show_buy_now: true,
    show_shipping: true,
    show_trust: true,
    show_accordions: true,
    related_count: 4,
    related_title: 'You may also like',
  },
  collection: {
    columns_desktop: 4,
    columns_mobile: 2,
    show_count: true,
    show_filters: true,
    show_sort: true,
  },
};

export type DisplaySettings = typeof DISPLAY_DEFAULTS;
export type CardDisplay = DisplaySettings['card'];
export type DetailDisplay = DisplaySettings['detail'];
export type CollectionDisplay = DisplaySettings['collection'];

function mergeGroup<T extends Record<string, unknown>>(defaults: T, raw: unknown): T {
  if (!raw || typeof raw !== 'object') return { ...defaults };
  const out = { ...defaults };
  for (const [k, dv] of Object.entries(defaults)) {
    const v = (raw as Record<string, unknown>)[k];
    if (v === undefined) continue;
    if (typeof dv === 'boolean' && typeof v === 'boolean') (out as Record<string, unknown>)[k] = v;
    else if (typeof dv === 'number' && typeof v === 'number') (out as Record<string, unknown>)[k] = v;
    else if (typeof dv === 'string' && typeof v === 'string') (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

export function mergeDisplay(raw: unknown): DisplaySettings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    card: mergeGroup(DISPLAY_DEFAULTS.card, r.card),
    detail: mergeGroup(DISPLAY_DEFAULTS.detail, r.detail),
    collection: mergeGroup(DISPLAY_DEFAULTS.collection, r.collection),
  };
}

export async function getDisplay(sb: SupabaseClient): Promise<DisplaySettings> {
  const { data } = await sb.from('site_settings').select('value').eq('key', 'templates').maybeSingle();
  return mergeDisplay((data as { value?: unknown } | null)?.value);
}
