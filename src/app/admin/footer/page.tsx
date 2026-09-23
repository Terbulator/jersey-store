import { requireAdmin, adminDataClient } from '@/lib/admin';
import { getSiteChrome } from '@/lib/site-chrome';
import { FooterForm } from './footer-form';

export const metadata = { title: 'Footer — HEADERR Admin' };

export default async function AdminFooterPage() {
  await requireAdmin();
  const { footer } = await getSiteChrome(await adminDataClient());

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Footer</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">Brand block, legal links, and footer chrome. Link columns are edited in Website → Navigation. Saving applies site-wide immediately.</p>
      </div>
      <FooterForm initial={footer} />
    </div>
  );
}
