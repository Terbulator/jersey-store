import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getProducts,
  getCategories,
  getEditions,
  getApprovedReviews,
} from '@/lib/storefront';
import type { StorefrontData } from '@/components/website/section-registry';

export interface HomepageSection {
  id: string | null;
  key: string;
  name: string;
  enabled: boolean;
  sort_order: number;
  settings: Record<string, unknown> | null;
  hasDraft: boolean;
}

// Single source of truth for homepage section rows. `live` resolves the
// published columns (what the storefront renders); `draft` overlays any
// unpublished draft columns (what the admin editor + preview render).
// Pass the anon client on the storefront, the service-role client in admin.
// With publishedOnly, the anon-safe RPC returns live columns only, so
// unpublished drafts never leave the database on the public path.
export async function getHomepageSections(
  sb: SupabaseClient,
  source: 'live' | 'draft',
  opts?: { publishedOnly?: boolean }
): Promise<HomepageSection[]> {
  if (opts?.publishedOnly) {
    const { data, error } = await sb.rpc('get_published_homepage_sections');
    if (error) throw new Error('Could not load sections.');
    const items: HomepageSection[] = ((data ?? []) as {
      id: string; key: string; name: string; enabled: boolean; sort_order: number; settings: Record<string, unknown> | null;
    }[]).map((s) => ({
      id: s.id,
      key: s.key,
      name: s.name ?? s.key,
      enabled: !!s.enabled,
      sort_order: s.sort_order,
      settings: (s.settings as Record<string, unknown> | null) ?? null,
      hasDraft: false,
    }));
    items.sort((a, b) => a.sort_order - b.sort_order);
    return items;
  }
  const { data, error } = await sb
    .from('homepage_sections')
    .select('id, key, name, enabled, sort_order, settings, draft_enabled, draft_sort_order, draft_settings, draft_deleted')
    .order('sort_order', { ascending: true });
  if (error) throw new Error('Could not load sections.');

  const useDraft = source === 'draft';
  const items: HomepageSection[] = [];
  for (const s of data ?? []) {
    const draftEnabled = (s.draft_enabled as boolean | null) ?? null;
    const draftOrder = (s.draft_sort_order as number | null) ?? null;
    const draftSettings = (s.draft_settings as Record<string, unknown> | null) ?? null;
    const draftDeleted = !!s.draft_deleted;
    // A row deleted in the editor stays live until publish: draft mode hides
    // it, live mode ignores the flag entirely.
    if (useDraft && draftDeleted) continue;
    const liveSettings = (s.settings as Record<string, unknown> | null) ?? null;
    items.push({
      id: s.id as string,
      key: s.key as string,
      name: (s.name as string) ?? (s.key as string),
      enabled: useDraft ? (draftEnabled ?? !!s.enabled) : !!s.enabled,
      sort_order: useDraft ? (draftOrder ?? (s.sort_order as number)) : (s.sort_order as number),
      settings: useDraft ? (draftSettings ?? liveSettings) : liveSettings,
      hasDraft: draftEnabled !== null || draftOrder !== null || draftSettings !== null || draftDeleted,
    });
  }
  items.sort((a, b) => a.sort_order - b.sort_order);
  return items;
}

// The mapped + filtered catalog data every homepage render consumes
// (published products, approved reviews — identical for live and preview).
export async function getHomepageStorefrontData(): Promise<StorefrontData> {
  const [products, categories, editions, reviews] = await Promise.all([
    getProducts(),
    getCategories(),
    getEditions(),
    getApprovedReviews(),
  ]);
  return { products, categories, editions, reviews };
}

export interface HomepageRenderData {
  items: HomepageSection[];
  settingsMap: Record<string, Record<string, unknown> | null>;
  storefrontData: StorefrontData;
}

// Everything a homepage render needs: effective sections, a settings map
// built from every row (so the all-sections fallback matches the storefront),
// and the shared catalog data.
export async function getHomepageRenderData(
  sb: SupabaseClient,
  source: 'live' | 'draft',
  opts?: { publishedOnly?: boolean }
): Promise<HomepageRenderData> {
  const [items, storefrontData] = await Promise.all([
    getHomepageSections(sb, source, opts),
    getHomepageStorefrontData(),
  ]);
  const settingsMap: Record<string, Record<string, unknown> | null> = {};
  for (const i of items) settingsMap[i.key] = i.settings;
  return { items, settingsMap, storefrontData };
}
