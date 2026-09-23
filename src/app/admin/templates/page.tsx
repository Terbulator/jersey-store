import { requireAdmin, adminDataClient } from '@/lib/admin';
import { getDisplay } from '@/lib/display';
import { TemplatesForm } from './templates-form';

export const metadata = { title: 'Templates — HEADERR Admin' };

export default async function AdminTemplatesPage() {
  await requireAdmin();
  const display = await getDisplay(await adminDataClient());

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Templates</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">
          One change here updates every product card, product page, and collection grid at once. Saving applies site-wide immediately.
        </p>
      </div>
      <TemplatesForm initial={display} />
    </div>
  );
}
