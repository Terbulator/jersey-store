import { AdminInProgress } from '@/components/admin/admin-in-progress';

export const metadata = { title: 'Media Library — HEADERR Admin' };

export default function AdminMenuPage() {
  return <AdminInProgress title="Media Library" description="Uploaded images and videos." />;
}
