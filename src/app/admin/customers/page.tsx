import { adminDataClient } from '@/lib/admin';

export const metadata = { title: 'Customers — HEADERR Admin' };

interface Customer {
  name: string;
  email: string;
  phone: string | null;
  orders: number;
  spent: number;
  lastAt: string;
}

export default async function AdminCustomersPage() {
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('orders')
    .select('customer_name, email, phone, total, status, created_at')
    .order('created_at', { ascending: false });
  const orders = data ?? [];

  const map = new Map<string, Customer>();
  for (const o of orders) {
    const key = (o.email ?? o.customer_name).toLowerCase();
    if (!map.has(key)) {
      map.set(key, { name: o.customer_name, email: o.email, phone: o.phone, orders: 0, spent: 0, lastAt: o.created_at });
    }
    const c = map.get(key)!;
    c.orders += 1;
    if (!['CANCELLED', 'REFUNDED'].includes(o.status)) c.spent += Number(o.total) || 0;
    if (new Date(o.created_at) > new Date(c.lastAt)) c.lastAt = o.created_at;
  }
  const customers = [...map.values()].sort((a, b) => b.spent - a.spent);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Customers</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">{customers.length} customers</p>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-md border border-[#292929] bg-[#111111] p-10 text-center">
          <p className="text-[13px] text-[#666666]">No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-[#292929] bg-[#111111]">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#292929] text-[10px] uppercase tracking-widest text-[#666666]">
                <th className="px-4 py-2.5 font-medium">Customer</th>
                <th className="px-4 py-2.5 font-medium">Phone</th>
                <th className="px-4 py-2.5 font-medium">Orders</th>
                <th className="px-4 py-2.5 font-medium">Spent</th>
                <th className="px-4 py-2.5 font-medium">Last order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292929]">
              {customers.map((c) => (
                <tr key={c.email} className="hover:bg-[#171717]">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#EFECE6]">{c.name}</p>
                    <a href={`mailto:${c.email}`} className="text-[11px] text-[#A8A8A8] hover:text-[#EFECE6]">
                      {c.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-[#A8A8A8]">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-[#A8A8A8]">{c.orders}</td>
                  <td className="px-4 py-3 text-[#EFECE6]">₹{c.spent.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-[#A8A8A8]">{new Date(c.lastAt).toLocaleDateString('en-IN')}</td>
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