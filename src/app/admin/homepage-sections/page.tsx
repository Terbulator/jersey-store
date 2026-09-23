import { requireAdmin, adminDataClient } from '@/lib/admin';
import { PreviewWrapper } from './preview-wrapper';
import { createClient } from '@/lib/supabase/server';
import { getProducts, getCategories, getEditions, getApprovedReviews } from '@/lib/storefront';

export const metadata = { title: 'Homepage Sections — HEADERR Admin' };

export default async function AdminHomepageSectionsPage() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('homepage_sections')
    .select('id, key, name, enabled, sort_order, settings')
    .order('sort_order', { ascending: true });

  const items = (data ?? []).map((s) => ({ ...s, enabled: !!s.enabled }));
  const settingsMap: Record<string, Record<string, unknown> | null> = {};
  for (const s of data ?? []) {
    const st = s.settings as Record<string, unknown> | null | undefined;
    settingsMap[s.key] = st ?? null;
  }

  const supabase = createClient();
  const { data: products } = await supabase.from('products').select('*').limit(20);
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
  const { data: editions } = await supabase.from('editions').select('*').order('sort_order', { ascending: true });
  const { data: reviews } = await supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(10);

  return (
    <div className="space-y-5">
      <PreviewWrapper
        items={items}
        settingsMap={settingsMap}
        products={(products ?? []) as Record<string, unknown>[]}
        categories={(categories ?? []) as Record<string, unknown>[]}
        editions={(editions ?? []) as Record<string, unknown>[]}
        reviews={(reviews ?? []) as Record<string, unknown>[]}
      />
      <div className="rounded-md border border-[#292929] bg-[#111111] p-4 text-[12px] text-[#A8A8A8]">
        If no sections are enabled, the homepage falls back to showing the full saved layout.
      </div>
    </div>
  );
}
