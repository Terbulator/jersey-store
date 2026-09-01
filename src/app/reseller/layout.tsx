import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { ResellerNav } from '@/components/reseller/reseller-nav';

export default async function ResellerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/auth/signin?callbackUrl=/reseller');

  const reseller = await prisma.reseller.findUnique({ where: { userId: user.id } });
  if (!reseller) redirect('/');
  if (reseller.status !== 'APPROVED') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-xl border p-6 text-center">
          <h1 className="text-xl font-bold mb-2">Reseller account pending</h1>
          <p className="text-sm text-muted-foreground">
            Your reseller account is not approved yet ({reseller.status.toLowerCase()}). Check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <ResellerNav userName={user.name} userEmail={user.email} />
      <main className="flex-1 overflow-x-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
