import { requireAdmin, adminDataClient } from '@/lib/admin';
import { getHomepageRenderData, type HomepageSection } from '@/lib/homepage';
import { getTheme, mergeTheme, type Theme } from '@/lib/theme';
import { getDisplay, mergeDisplay, type DisplaySettings } from '@/lib/display';
import type { StorefrontData } from '@/components/website/section-registry';
import { ThemeEditor } from './theme-editor';

export const metadata = { title: 'Theme Editor — HEADERR Admin' };

export type EditorSection = HomepageSection;

export default async function AdminThemeEditorPage() {
  await requireAdmin();

  // Draft-over-live: the editor works on unpublished state, preview included.
  let initialItems: EditorSection[] = [];
  let storefrontData: StorefrontData = { products: [], categories: [], editions: [], reviews: [] };
  let initialTheme: Theme = mergeTheme(null);
  let initialDisplay: DisplaySettings = mergeDisplay(null);
  let initialUpdatedAt: string | null = null;
  let sectionsError: string | null = null;
  try {
    const sb = await adminDataClient();
    const data = await getHomepageRenderData(sb, 'draft');
    initialItems = data.items;
    storefrontData = data.storefrontData;
    initialTheme = await getTheme(sb);
    initialDisplay = await getDisplay(sb);
    const { data: touched } = await sb.from('homepage_sections').select('updated_at').order('updated_at', { ascending: false }).limit(1);
    initialUpdatedAt = ((touched?.[0] as { updated_at?: string } | undefined)?.updated_at) ?? null;
  } catch (e) {
    sectionsError = e instanceof Error ? e.message : 'Could not load sections.';
  }

  return (
    <ThemeEditor
      initialItems={initialItems}
      storefrontData={storefrontData}
      sectionsError={sectionsError}
      initialTheme={initialTheme}
      initialDisplay={initialDisplay}
      initialUpdatedAt={initialUpdatedAt}
    />
  );
}