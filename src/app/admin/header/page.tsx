import { requireAdmin, adminDataClient } from '@/lib/admin';
import { getSiteChrome } from '@/lib/site-chrome';
import { HeaderForm } from './header-form';

export const metadata = { title: 'Header — HEADERR Admin' };

export default async function AdminHeaderPage() {
  await requireAdmin();
  const { header } = await getSiteChrome(await adminDataClient());

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Header</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">Logo, navigation behavior, and header icons. Saving applies site-wide immediately.</p>
      </div>
      <HeaderForm initial={header} />
    </div>
  );
}
