import { adminDataClient } from '@/lib/admin';
import { CrudManager, type CrudField } from '@/components/admin/crud-manager';

export const metadata = { title: 'Collections — HEADERR Admin' };

const fields: CrudField[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'slug', label: 'Slug', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea', rows: 2 },
  { key: 'image', label: 'Image URL', type: 'text', placeholder: 'https://…' },
];

export default async function AdminCollectionsPage() {
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('collections')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  const items = data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Collections</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">{items.length} collections</p>
      </div>
      <CrudManager items={items} fields={fields} apiPath="/api/admin/collections" requiredField="name" addLabel="Add collection" />
      {error && <p className="text-[12px] text-[#EF4444]">Could not load collections.</p>}
    </div>
  );
}