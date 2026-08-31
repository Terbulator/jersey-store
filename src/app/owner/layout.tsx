import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { OwnerNav } from '@/components/owner/owner-nav';

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect('/auth/signin?callbackUrl=/owner');
  if (user.role !== 'OWNER') redirect('/');

  return (
    <div className="flex min-h-screen">
      <OwnerNav userName={user.name} userEmail={user.email} />
      <main className="flex-1 overflow-x-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
