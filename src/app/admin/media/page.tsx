import { requireAdmin, adminDataClient } from '@/lib/admin';
import { MediaManager } from './media-manager';

export const metadata = { title: 'Media Library — HEADERR Admin' };

export default async function AdminMediaPage() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('media_assets')
    .select('id, url, file_name, alt, kind, mime_type, size_bytes')
    .order('created_at', { ascending: false })
    .limit(500);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Media Library</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">{data?.length ?? 0} assets — deleting an asset first shows everywhere it is used.</p>
      </div>
      <MediaManager items={data ?? []} />
      {error && <p className="text-[12px] text-[#EF4444]">Could not load media.</p>}
    </div>
  );
}
