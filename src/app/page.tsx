import { createClient } from '@/lib/supabase/server';
import {
  getProducts,
  getCategories,
  getEditions,
  getApprovedReviews,
} from '@/lib/storefront';
import type { StorefrontData, SectionKey } from '@/components/website/section-registry';
import { SECTION_ORDER, renderSection, renderAllSections } from '@/components/website/section-registry';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('homepage_sections')
    .select('key, enabled, settings')
    .eq('enabled', true)
    .order('sort_order', { ascending: true });

  const settingsMap: Record<string, Record<string, unknown> | null> = {};
  for (const s of (data ?? [])) {
    if (s.enabled && s.settings && typeof s.settings === 'object') settingsMap[s.key] = s.settings as Record<string, unknown>;
  }

  const storefrontData: StorefrontData = {
    products: await getProducts(),
    categories: await getCategories(),
    editions: await getEditions(),
    reviews: await getApprovedReviews(),
  };

  const orderedData = data ?? [];
  if (orderedData.length) {
    const enabledKeys = orderedData.filter((d) => d.enabled).map((d) => d.key);
    const sections = enabledKeys
      .map((key) => ({ key: key as SectionKey, order: orderedData.findIndex((d) => d.key === key) }))
      .sort((a, b) => a.order - b.order)
      .map(({ key }) => renderSection(key, settingsMap[key] ?? null, storefrontData));
    return <>{sections}</>;
  }

  return <>{renderAllSections(settingsMap, storefrontData)}</>;
}