import { requireAdmin, adminDataClient } from '@/lib/admin';

export const metadata = { title: 'Customers — HEADERR Admin' };

export default async function AdminCustomersPage() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('orders')
    .select('id, customer_name, email, phone, total, status, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  const orders = data ?? [];
  const byEmail = new Map<string, { name: string; email: string; phone: string | null; orders: number; spend: number; lastOrder: string }>();
  for (const o of orders) {
    const key = (o.email ?? '').toLowerCase();
    const existing = byEmail.get(key);
    const spend = Number(o.total);
    if (existing) {
      existing.orders += 1;
      existing.spend += spend;
      existing.lastOrder = o.created_at;
    } else {
      byEmail.set(key, {
        name: o.customer_name,
        email: o.email ?? '',
        phone: o.phone ?? null,
        orders: 1,
        spend,
        lastOrder: o.created_at,
      });
    }
  }
  const customers = [...byEmail.values()]
    .sort((a, b) => b.spend - a.spend)
    .map((c) => ({ ...c, spend: Math.round(c.spend * 100) / 100 }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#EFECE6]">Customers</h1>
          <p className="mt-0.5 text-[12px] text-[#A8A8A8]">{customers.length} customers from real orders</p>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-md border border-[#292929] bg-[#111111] p-10 text-center">
          <p className="text-[13px] text-[#666666]">No customers yet — they appear here once orders come in.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-[#292929] bg-[#111111]">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#292929] text-[10px] uppercase tracking-widest text-[#666666]">
                <th className="px-4 py-2.5 font-medium">Customer</th>
                <th className="px-4 py-2.5 font-medium">Phone</th>
                <th className="px-4 py-2.5 font-medium">Orders</th>
                <th className="px-4 py-2.5 font-medium">Total spent</th>
                <th className="px-4 py-2.5 font-medium">Last order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292929]">
              {customers.map((c) => (
                <tr key={c.email} className="hover:bg-[#171717]">
                  <td className="px-4 py-3">
                    <p className="text-[#EFECE6]">{c.name}</p>
                    <p className="text-[11px] text-[#666666]">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[#A8A8A8]">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-[#A8A8A8]">{c.orders}</td>
                  <td className="px-4 py-3 font-medium text-[#EFECE6]">₹{c.spend.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-[#A8A8A8]">{new Date(c.lastOrder).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {error && <p className="text-[12px] text-[#EF4444]">Could not load customers.</p>}
    </div>
  );
}