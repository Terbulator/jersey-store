import { adminDataClient } from '@/lib/admin';
import { AdminUsersManager } from './admin-users-manager';

export const metadata = { title: 'Admin Users — HEADERR Admin' };

export default async function AdminUsersPage() {
  const sb = await adminDataClient();
  const { data: rows, error } = await sb.from('admin_users').select('id, user_id, role');
  const { data: users } = await sb.schema('auth').from('users').select('id, email');

  const emailById = new Map((users ?? []).map((u) => [u.id, u.email]));
  const items = (rows ?? []).map((r) => ({
    id: r.id,
    email: emailById.get(r.user_id) ?? 'Unknown user',
    role: r.role,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Admin Users</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">{items.length} admins</p>
      </div>
      <AdminUsersManager items={items} />
      {error && <p className="text-[12px] text-[#EF4444]">Could not load admin users.</p>}
    </div>
  );
}