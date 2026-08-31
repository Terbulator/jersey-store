import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { WorkerNav } from '@/components/worker/worker-nav';

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect('/auth/signin?callbackUrl=/worker');
  if (user.role !== 'WORKER') redirect('/');

  return (
    <div className="flex min-h-screen">
      <WorkerNav userName={user.name} />
      <main className="flex-1 overflow-x-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
