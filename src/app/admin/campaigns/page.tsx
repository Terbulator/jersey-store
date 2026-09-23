import { adminDataClient } from '@/lib/admin';
import { CrudManager, type CrudField } from '@/components/admin/crud-manager';

export const metadata = { title: 'Campaigns — HEADERR Admin' };

const fields: CrudField[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
  { key: 'image', label: 'Image URL', type: 'text', placeholder: 'https://…' },
  { key: 'cta_text', label: 'CTA Text', type: 'text' },
  { key: 'cta_url', label: 'CTA URL', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', options: ['draft', 'scheduled', 'active', 'expired'] },
];

export default async function AdminCampaignsPage() {
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('campaigns')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  const items = data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Campaigns</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">{items.length} campaigns</p>
      </div>
      <CrudManager items={items} fields={fields} apiPath="/api/admin/campaigns" requiredField="name" addLabel="Add campaign" />
      {error && <p className="text-[12px] text-[#EF4444]">Could not load campaigns.</p>}
    </div>
  );
}