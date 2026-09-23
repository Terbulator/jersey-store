import { requireAdmin, adminDataClient } from '@/lib/admin';
import { getProducts, getCategories, getEditions, getApprovedReviews } from '@/lib/storefront';
import type { StorefrontData } from '@/components/website/section-registry';
import { ThemeEditor } from './theme-editor';

export const metadata = { title: 'Theme Editor — HEADERR Admin' };

export interface EditorSection {
  key: string;
  name: string;
  enabled: boolean;
  sort_order: number;
  settings: Record<string, unknown> | null;
  hasDraft: boolean;
}

export default async function AdminThemeEditorPage() {
  await requireAdmin();

  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('homepage_sections')
    .select('id, key, name, enabled, sort_order, settings, draft_enabled, draft_sort_order, draft_settings')
    .order('sort_order', { ascending: true });

  const initialItems: EditorSection[] = (data ?? []).map((s) => {
    const draftEnabled = s.draft_enabled ?? null;
    const draftOrder = s.draft_sort_order ?? null;
    const draftSettings = (s.draft_settings as Record<string, unknown> | null) ?? null;
    return {
      key: s.key as string,
      name: s.name as string,
      enabled: draftEnabled ?? !!s.enabled,
      sort_order: draftOrder ?? (s.sort_order as number),
      settings: draftSettings ?? ((s.settings as Record<string, unknown>) ?? null),
      hasDraft: draftEnabled !== null || draftOrder !== null || draftSettings !== null,
    };
  });
  initialItems.sort((a, b) => a.sort_order - b.sort_order);

  const storefrontData: StorefrontData = {
    products: await getProducts(),
    categories: await getCategories(),
    editions: await getEditions(),
    reviews: await getApprovedReviews(),
  };

  return (
    <ThemeEditor
      initialItems={initialItems}
      storefrontData={storefrontData}
      sectionsError={error?.message ?? null}
    />
  );
}