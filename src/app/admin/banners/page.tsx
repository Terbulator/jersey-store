import { adminDataClient } from '@/lib/admin';
import { CrudManager, type CrudField } from '@/components/admin/crud-manager';

export const metadata = { title: 'Banners — HEADERR Admin' };

const fields: CrudField[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
  { key: 'headline', label: 'Headline', type: 'text' },
  { key: 'copy', label: 'Copy', type: 'textarea', rows: 3 },
  { key: 'image', label: 'Image', type: 'image' },
  { key: 'cta_text', label: 'CTA Text', type: 'text' },
  { key: 'cta_url', label: 'CTA URL', type: 'text' },
];

export default async function AdminBannersPage() {
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  const items = data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Banners</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">{items.length} banners</p>
      </div>
      <CrudManager items={items} fields={fields} apiPath="/api/admin/banners" requiredField="name" addLabel="Add banner" />
      {error && <p className="text-[12px] text-[#EF4444]">Could not load banners.</p>}
    </div>
  );
}