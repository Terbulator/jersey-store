import { AdminInProgress } from '@/components/admin/admin-in-progress';

export const metadata = { title: 'Payments — HEADERR Admin' };

export default function AdminMenuPage() {
  return <AdminInProgress title="Payments" description="Payment providers and settings." />;
}
