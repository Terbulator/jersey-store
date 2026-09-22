import { AdminInProgress } from '@/components/admin/admin-in-progress';

export const metadata = { title: 'Admin Users — HEADERR Admin' };

export default function AdminMenuPage() {
  return <AdminInProgress title="Admin Users" description="Manage who has access to the admin." />;
}
