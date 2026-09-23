import { adminDataClient } from '@/lib/admin';

export const metadata = { title: 'Payments — HEADERR Admin' };

interface Order {
  order_number: string;
  created_at: string;
  customer_name: string;
  email: string;
  payment_method: string;
  payment_status: string;
  total: number;
}

export default async function AdminPaymentsPage() {
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('orders')
    .select('order_number, created_at, customer_name, email, payment_method, payment_status, total')
    .order('created_at', { ascending: false })
    .limit(100);
  const orders = (data ?? []) as Order[];

  const methods = new Map<string, { count: number; total: number }>();
  const statuses = new Map<string, { count: number; total: number }>();
  let collected = 0;
  for (const o of orders) {
    const m = methods.get(o.payment_method) ?? { count: 0, total: 0 };
    m.count += 1;
    m.total += Number(o.total) || 0;
    methods.set(o.payment_method, m);
    const s = statuses.get(o.payment_status) ?? { count: 0, total: 0 };
    s.count += 1;
    s.total += Number(o.total) || 0;
    statuses.set(o.payment_status, s);
    if (o.payment_status === 'PAID') collected += Number(o.total) || 0;
  }

  const cell = (label: string, count: number, total: number) => (
    <span className="flex items-center justify-between gap-2 rounded-md border border-[#292929] bg-[#0D0D0D] px-3 py-2">
      <span className="text-[#A8A8A8]">{label}</span>
      <span className="font-semibold text-[#EFECE6]">
        {count} · ₹{total.toLocaleString('en-IN')}
      </span>
    </span>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Payments</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">
          {orders.length} recent orders · ₹{collected.toLocaleString('en-IN')} collected
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-md border border-[#292929] bg-[#111111] p-4">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-[#666666]">By method</p>
          <div className="space-y-2">
            {[...methods.entries()].map(([k, v]) => cell(k, v.count, v.total))}
          </div>
        </div>
        <div className="rounded-md border border-[#292929] bg-[#111111] p-4">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-[#666666]">By status</p>
          <div className="space-y-2">
            {[...statuses.entries()].map(([k, v]) => cell(k, v.count, v.total))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-[#292929] bg-[#111111]">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-[#292929] text-[10px] uppercase tracking-widest text-[#666666]">
              <th className="px-4 py-2.5 font-medium">Order</th>
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Customer</th>
              <th className="px-4 py-2.5 font-medium">Method</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#292929]">
            {orders.map((o) => (
              <tr key={o.order_number} className="hover:bg-[#171717]">
                <td className="px-4 py-3 font-mono text-[#EFECE6]">{o.order_number}</td>
                <td className="px-4 py-3 text-[#A8A8A8]">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3 text-[#A8A8A8]">{o.customer_name}</td>
                <td className="px-4 py-3 text-[#A8A8A8]">{o.payment_method}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      o.payment_status === 'PAID'
                        ? 'bg-[#4ADE80]/15 text-[#4ADE80]'
                        : o.payment_status === 'FAILED'
                          ? 'bg-[#EF4444]/15 text-[#EF4444]'
                          : 'bg-[#FBBF24]/15 text-[#FBBF24]'
                    }`}
                  >
                    {o.payment_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-[#EFECE6]">₹{Number(o.total).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <p className="text-[12px] text-[#EF4444]">Could not load payments.</p>}
    </div>
  );
}