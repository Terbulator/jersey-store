import { requireAdmin, adminDataClient } from '@/lib/admin';
import { AnnouncementsManager } from './announcements-manager';

export const metadata = { title: 'Announcements — HEADERR Admin' };

export default async function AdminAnnouncementsPage() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, error } = await sb.from('announcements').select('*').order('sort_order', { ascending: true });
  const items = data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Announcements</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">Rotating messages in the storefront announcement bar.</p>
      </div>
      <AnnouncementsManager items={items} />
      {error && <p className="text-[12px] text-[#EF4444]">Could not load announcements.</p>}
    </div>
  );
}