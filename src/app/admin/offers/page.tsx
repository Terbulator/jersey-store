import { adminDataClient } from '@/lib/admin';
import { CrudManager, type CrudField } from '@/components/admin/crud-manager';

export const metadata = { title: 'Offers — HEADERR Admin' };

const fields: CrudField[] = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
  { key: 'badge', label: 'Badge', type: 'text' },
  { key: 'code', label: 'Code', type: 'text' },
  { key: 'discount_text', label: 'Discount', type: 'text' },
  { key: 'image', label: 'Image', type: 'image' },
  { key: 'cta_text', label: 'CTA Text', type: 'text' },
  { key: 'cta_url', label: 'CTA URL', type: 'text' },
];

export default async function AdminOffersPage() {
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('offers')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  const items = data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Offers</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">{items.length} offers</p>
      </div>
      <CrudManager items={items} fields={fields} apiPath="/api/admin/offers" requiredField="title" addLabel="Add offer" />
      {error && <p className="text-[12px] text-[#EF4444]">Could not load offers.</p>}
    </div>
  );
}