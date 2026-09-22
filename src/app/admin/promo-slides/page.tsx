import { requireAdmin, adminDataClient } from '@/lib/admin';
import { PromoSlidesManager } from './promo-slides-manager';

export const metadata = { title: 'Promotional Slides — HEADERR Admin' };

export default async function AdminPromoSlidesPage() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, count, error } = await sb
    .from('promo_slides')
    .select('id, eyebrow, headline, subheadline, desktop_image, mobile_image, cta_text, cta_url, status, active, sort_order, updated_at', { count: 'exact' })
    .order('sort_order', { ascending: true });

  const items = data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Promotional Slides</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">
          {count ?? 0} slides · the top active slide renders in the storefront hero
        </p>
      </div>
      {error && <p className="text-[12px] text-[#EF4444]">Could not load slides.</p>}
      <PromoSlidesManager items={items} />
    </div>
  );
}