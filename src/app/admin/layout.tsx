import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { AdminNav } from '@/components/admin/admin-nav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect('/auth/signin?callbackUrl=/admin');
  if (user.role !== 'ADMIN') redirect('/');

  return (
    <div className="flex min-h-screen">
      <AdminNav userName={user.name} userEmail={user.email} />
      <main className="flex-1 overflow-x-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
