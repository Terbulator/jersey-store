import { requireAdmin, adminDataClient } from '@/lib/admin';
import { CouponCreator } from './coupon-creator';

export const metadata = { title: 'Coupons — HEADERR Admin' };

export default async function AdminCouponsPage() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, error } = await sb.from('coupons').select('*').order('created_at', { ascending: false });
  const coupons = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#EFECE6]">Coupons</h1>
          <p className="mt-0.5 text-[12px] text-[#A8A8A8]">{coupons.length} coupons</p>
        </div>
        <CouponCreator />
      </div>

      {coupons.length === 0 ? (
        <div className="rounded-md border border-[#292929] bg-[#111111] p-10 text-center">
          <p className="text-[13px] text-[#666666]">No coupons yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-[#292929] bg-[#111111]">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#292929] text-[10px] uppercase tracking-widest text-[#666666]">
                <th className="px-4 py-2.5 font-medium">Code</th>
                <th className="px-4 py-2.5 font-medium">Discount</th>
                <th className="px-4 py-2.5 font-medium">Min spend</th>
                <th className="px-4 py-2.5 font-medium">Uses</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292929]">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#171717]">
                  <td className="px-4 py-3 font-mono text-[12px] font-semibold text-[#EFECE6]">{c.code}</td>
                  <td className="px-4 py-3 text-[#A8A8A8]">
                    {c.type === 'percent' ? `${Number(c.value)}%` : `₹${Number(c.value).toLocaleString('en-IN')}`}
                    {c.max_discount ? ` (max ₹${Number(c.max_discount).toLocaleString('en-IN')})` : ''}
                  </td>
                  <td className="px-4 py-3 text-[#A8A8A8]">{c.min_spend ? `₹${Number(c.min_spend).toLocaleString('en-IN')}` : '—'}</td>
                  <td className="px-4 py-3 text-[#A8A8A8]">
                    {c.used_count}
                    {c.max_uses ? ` / ${c.max_uses}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${c.active ? 'bg-[#4ADE80]/15 text-[#4ADE80]' : 'bg-[#292929] text-[#666666]'}`}>
                      {c.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {error && <p className="text-[12px] text-[#EF4444]">Could not load coupons.</p>}
    </div>
  );
}