import { requireAdmin, adminDataClient } from '@/lib/admin';
import { AnalyticsDashboard } from './analytics-dashboard';
import { DateRangePicker } from './date-range-picker';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Analytics — HEADERR Admin' };

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: { view?: string; from?: string; to?: string } | Promise<{ view?: string; from?: string; to?: string }>;
}) {
  await requireAdmin();
  const sb = await adminDataClient();
  const params = await Promise.resolve(searchParams);

  const view = params.view ?? 'overview';
  const fromParam = params.from;
  const toParam = params.to;

  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 30);
  const from = fromParam ? new Date(fromParam).toISOString() : defaultFrom.toISOString();
  const to = toParam ? new Date(toParam).toISOString() : new Date().toISOString();

  const [{ data: events }, { data: products }, { data: orders }] = await Promise.all([
    sb
      .from('analytics_events')
      .select('event, page_url, created_at, product_name, category, price')
      .gte('created_at', from)
      .lte('created_at', to)
      .order('created_at', { ascending: false })
      .limit(1000),
    sb.from('products').select('slug, name, category, price').eq('published', true).order('slug', { ascending: true }),
    sb
      .from('orders')
      .select('id, order_number, total, subtotal, shipping, discount, status, payment_status, items, customer_name, email, created_at')
      .gte('created_at', from)
      .lte('created_at', to)
      .order('created_at', { ascending: false })
      .limit(500),
  ]);

  const dateLabel = fromParam || toParam
    ? `Custom range · ${new Date(from).toLocaleDateString('en-IN')} – ${new Date(to).toLocaleDateString('en-IN')}`
    : 'Last 30 days';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-[#EFECE6]">Analytics</h1>
          <p className="mt-0.5 text-[12px] text-[#A8A8A8]">{dateLabel} · aggregated from analytics_events + orders</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={fromParam || toParam ? `/admin/analytics?from=${encodeURIComponent(fromParam || '')}&to=${encodeURIComponent(toParam || '')}` : '/admin/analytics'}
            className={`rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase transition-colors ${
              view === 'overview'
                ? 'bg-[#B3001B] text-[#EFECE6]'
                : 'border border-[#292929] text-[#A8A8A8] hover:border-[#3a3a3a] hover:text-[#EFECE6]'
            }`}
          >
            Overview
          </a>
          <a
            href={fromParam || toParam ? `/admin/analytics?view=sales&from=${encodeURIComponent(fromParam || '')}&to=${encodeURIComponent(toParam || '')}` : '/admin/analytics?view=sales'}
            className={`rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase transition-colors ${
              view === 'sales'
                ? 'bg-[#B3001B] text-[#EFECE6]'
                : 'border border-[#292929] text-[#A8A8A8] hover:border-[#3a3a3a] hover:text-[#EFECE6]'
            }`}
          >
            Sales
          </a>
          <DateRangePicker />
        </div>
      </div>
      <AnalyticsDashboard view={view} events={events ?? []} products={products ?? []} orders={orders ?? []} />
    </div>
  );
}