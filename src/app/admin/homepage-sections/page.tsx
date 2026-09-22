import { requireAdmin, adminDataClient } from '@/lib/admin';
import { HomepageSectionsManager } from './homepage-sections-manager';

export const metadata = { title: 'Homepage Sections — HEADERR Admin' };

export default async function AdminHomepageSectionsPage() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('homepage_sections')
    .select('id, key, name, enabled, sort_order')
    .order('sort_order', { ascending: true });

  const items = (data ?? []).map((s) => ({ ...s, enabled: !!s.enabled }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Homepage Sections</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">Toggle and reorder what renders on the storefront homepage.</p>
      </div>
      {error && <p className="text-[12px] text-[#EF4444]">Could not load sections.</p>}
      <HomepageSectionsManager items={items} />
      <div className="rounded-md border border-[#292929] bg-[#111111] p-4 text-[12px] text-[#A8A8A8]">
        If no sections are enabled, the homepage falls back to showing the full saved layout.
      </div>
    </div>
  );
}