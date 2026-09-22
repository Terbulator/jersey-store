import { requireAdmin, adminDataClient } from '@/lib/admin';
import { ReviewsManager } from './reviews-manager';

export const metadata = { title: 'Reviews — HEADERR Admin' };

export default async function AdminReviewsPage() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, count, error } = await sb
    .from('reviews')
    .select('id, product_name, product_variant, customer_name, rating, title, body, verified_buyer, status, featured, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  const items = data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Reviews</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">
          {count ?? 0} reviews ·{' '}
          {items.filter((r) => r.status === 'pending').length} pending
        </p>
      </div>
      {error && <p className="text-[12px] text-[#EF4444]">Could not load reviews.</p>}
      <ReviewsManager items={items.map((r) => ({ ...r, rating: Number(r.rating) }))} />
    </div>
  );
}