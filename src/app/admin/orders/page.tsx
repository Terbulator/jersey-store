import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { adminDataClient } from '@/lib/admin';
import { OrderStatusBadge, formatDate } from '@/lib/admin-ui';
import { StatusSelect } from './status-select';

export const metadata = { title: 'Orders — HEADERR Admin' };

const ORDER_STATUSES = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  await requireAdmin();
  const status = ORDER_STATUSES.includes((searchParams.status ?? 'ALL').toUpperCase())
    ? (searchParams.status ?? 'ALL').toUpperCase()
    : 'ALL';
  const page = Math.max(1, Number(searchParams.page) || 1);
  const perPage = 20;

  const sb = await adminDataClient();
  let query = sb.from('orders').select('id, order_number, customer_name, email, total, status, payment_status, created_at', { count: 'exact' });
  if (status !== 'ALL') query = query.eq('status', status);
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  const orders = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#EFECE6]">Orders</h1>
          <p className="mt-0.5 text-[12px] text-[#A8A8A8]">{count ?? 0} orders</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {ORDER_STATUSES.map((s) => {
          const href = s === 'ALL' ? '/admin/orders' : `/admin/orders?status=${s}`;
          const active = status === s;
          return (
            <Link
              key={s}
              href={href}
              className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
                active
                  ? 'border-[#B3001B] bg-[#B3001B]/15 text-[#EFECE6]'
                  : 'border-[#292929] text-[#A8A8A8] hover:border-[#3a3a3a]'
              }`}
            >
              {s}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-md border border-[#292929] bg-[#111111] p-10 text-center">
          <p className="text-[13px] text-[#666666]">
            {status === 'ALL' ? 'No orders yet — they will appear here as customers check out.' : `No ${status} orders.`}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-[#292929] bg-[#111111]">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#292929] text-[10px] uppercase tracking-widest text-[#666666]">
                <th className="px-4 py-2.5 font-medium">Order</th>
                <th className="px-4 py-2.5 font-medium">Customer</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Total</th>
                <th className="px-4 py-2.5 font-medium">Payment</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292929]">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#171717]">
                  <td className="px-4 py-3 font-mono text-[11px] text-[#EFECE6]">{o.order_number}</td>
                  <td className="px-4 py-3">
                    <p className="text-[#EFECE6]">{o.customer_name}</p>
                    <p className="text-[11px] text-[#666666]">{o.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[#A8A8A8]">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-[#EFECE6]">₹{Number(o.total).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] text-[#A8A8A8]">{o.payment_status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={o.status} />
                      <StatusSelect orderId={o.id} current={o.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {count && count > perPage && (
        <div className="flex items-center gap-3 text-[12px] text-[#A8A8A8]">
          <Link
            href={`/admin/orders?status=${status}&page=${page - 1}`}
            className={`rounded-md border border-[#292929] px-3 py-1 ${page <= 1 ? 'pointer-events-none opacity-40' : 'hover:border-[#3a3a3a]'}`}
          >
            Prev
          </Link>
          <span>
            Page {page} of {Math.ceil(count / perPage)}
          </span>
          <Link
            href={`/admin/orders?status=${status}&page=${page + 1}`}
            className={`rounded-md border border-[#292929] px-3 py-1 ${page * perPage >= count ? 'pointer-events-none opacity-40' : 'hover:border-[#3a3a3a]'}`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}