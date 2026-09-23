import { adminDataClient } from '@/lib/admin';
import { CrudManager, type CrudField } from '@/components/admin/crud-manager';

export const metadata = { title: 'Media Library — HEADERR Admin' };

const fields: CrudField[] = [
  { key: 'url', label: 'URL', type: 'text', placeholder: 'https://…' },
  { key: 'alt', label: 'Alt text', type: 'text' },
  { key: 'file_name', label: 'File name', type: 'text' },
  { key: 'mime_type', label: 'MIME', type: 'text' },
  { key: 'size_bytes', label: 'Size (bytes)', type: 'number' },
];

export default async function AdminMediaPage() {
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false });
  const items = data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Media Library</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">{items.length} assets</p>
      </div>
      <CrudManager items={items} fields={fields} apiPath="/api/admin/media" requiredField="url" toggleFields={[]} hasSort={false} addLabel="Add asset" />
      {error && <p className="text-[12px] text-[#EF4444]">Could not load media.</p>}
    </div>
  );
}