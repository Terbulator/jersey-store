'use client';

import { useMemo } from 'react';

interface AnalyticsEvent {
  event: string;
  page_url: string | null;
  created_at: string;
  product_name: string | null;
  category: string | null;
  price: number | null;
}

interface Product {
  slug: string;
  name: string;
  category: string;
  price: number;
}

interface OrderItem {
  productId?: string;
  name?: string;
  slug?: string;
  price?: number;
  quantity?: number;
  size?: string;
}

interface Order {
  id?: string;
  order_number?: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  discount?: number;
  status: string;
  payment_status?: string;
  items?: OrderItem[];
  customer_name?: string;
  email?: string;
  created_at: string;
}

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Page views',
  product_view: 'Product views',
  add_to_cart: 'Add to cart',
  remove_from_cart: 'Removed from cart',
  begin_checkout: 'Begin checkout',
  purchase: 'Purchase',
};

const EVENT_COLOR: Record<string, string> = {
  page_view: 'bg-[#60A5FA]',
  product_view: 'bg-[#9B6BFF]',
  add_to_cart: 'bg-[#4ADE80]',
  remove_from_cart: 'bg-[#EF4444]',
  begin_checkout: 'bg-[#FBBF24]',
  purchase: 'bg-[#B3001B]',
};

function dayKey(ts: string) {
  return ts.slice(0, 10);
}

export function AnalyticsDashboard({
  view = 'overview',
  events,
  products,
  orders,
}: {
  view?: string;
  events: AnalyticsEvent[];
  products: Product[];
  orders: Order[];
}) {
  const summary = useMemo(() => {
    const byEvent = new Map<string, number>();
    const byDay = new Map<string, number>();
    const productViews = new Map<string, number>();
    const categoryViews = new Map<string, number>();

    for (const e of events) {
      byEvent.set(e.event, (byEvent.get(e.event) ?? 0) + 1);
      byDay.set(dayKey(e.created_at), (byDay.get(dayKey(e.created_at)) ?? 0) + 1);
      if (e.event === 'product_view') {
        const name = e.product_name ?? 'Unknown';
        productViews.set(name, (productViews.get(name) ?? 0) + 1);
        if (e.category) categoryViews.set(e.category, (categoryViews.get(e.category) ?? 0) + 1);
      }
    }

    const topEvents = [...byEvent.entries()].sort((a, b) => b[1] - a[1]);
    const topViewedProducts = [...productViews.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const topCategories = [...categoryViews.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const days = [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    // Sales metrics derived strictly from actual orders
    const validOrders = orders.filter((o) => o.status !== 'CANCELLED');
    const totalRevenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const totalOrders = orders.length;
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Top selling products from real order line items
    const productSalesMap = new Map<string, { name: string; units: number; revenue: number }>();
    for (const order of orders) {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        const name = item.name ?? 'Item';
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const current = productSalesMap.get(name) ?? { name, units: 0, revenue: 0 };
        current.units += qty;
        current.revenue += price * qty;
        productSalesMap.set(name, current);
      }
    }
    const topSellingProducts = [...productSalesMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);

    // Orders status breakdown
    const ordersByStatus = new Map<string, number>();
    for (const order of orders) {
      const st = order.status || 'PENDING';
      ordersByStatus.set(st, (ordersByStatus.get(st) ?? 0) + 1);
    }

    const purchases = byEvent.get('purchase') ?? 0;
    const checkoutCount = topEvents.find(([e]) => e === 'begin_checkout')?.[1] ?? 0;
    const conversion = checkoutCount > 0 ? Math.round((purchases / checkoutCount) * 100) : 0;

    return {
      totalEvents: events.length,
      totalRevenue,
      totalOrders,
      aov,
      purchases,
      conversion,
      topEvents,
      topViewedProducts,
      topCategories,
      topSellingProducts,
      ordersByStatus: [...ordersByStatus.entries()],
      days,
    };
  }, [events, orders]);

  const maxDay = Math.max(1, ...summary.days.map(([, v]) => v));
  const maxViewedProduct = Math.max(1, ...summary.topViewedProducts.map(([, v]) => v));
  const maxSellingRevenue = Math.max(1, ...summary.topSellingProducts.map((p) => p.revenue));

  const fmt = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
    return String(n);
  };

  if (view === 'sales') {
    return (
      <div className="space-y-5">
        {/* Sales KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Total Revenue', `₹${fmt(summary.totalRevenue)}`],
            ['Total Orders', String(summary.totalOrders)],
            ['Average Order Value', `₹${fmt(summary.aov)}`],
            ['Purchases Tracked', String(summary.purchases)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-[#292929] bg-[#111111] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#666666]">{label}</p>
              <p className="mt-1 font-display text-2xl text-[#EFECE6]">{value}</p>
            </div>
          ))}
        </div>

        {/* Top selling products & Status breakdown */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-[#292929] bg-[#111111] p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#666666]">
              Top selling products
            </p>
            {summary.topSellingProducts.length === 0 ? (
              <p className="text-[13px] text-[#666666]">No order item sales recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {summary.topSellingProducts.map((p) => (
                  <div key={p.name} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="truncate text-[#EFECE6]">{p.name}</span>
                      <span className="font-mono text-[#EFECE6]">₹{p.revenue.toLocaleString('en-IN')} ({p.units} units)</span>
                    </div>
                    <div className="h-1.5 w-full rounded bg-[#292929] overflow-hidden">
                      <div
                        className="h-full bg-[#B3001B]"
                        style={{ width: `${(p.revenue / maxSellingRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-md border border-[#292929] bg-[#111111] p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#666666]">
              Orders by status
            </p>
            {summary.ordersByStatus.length === 0 ? (
              <p className="text-[13px] text-[#666666]">No orders recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {summary.ordersByStatus.map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between py-1 border-b border-[#1f1f1f] last:border-0 text-[12px]">
                    <span className="text-[#A8A8A8]">{status}</span>
                    <span className="font-mono text-[#EFECE6]">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent orders table */}
        <div className="rounded-md border border-[#292929] bg-[#111111] p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#666666]">Recent orders</p>
          {orders.length === 0 ? (
            <p className="text-[13px] text-[#666666]">No orders in this range.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-[#292929] text-[10px] uppercase tracking-widest text-[#666666]">
                    <th className="pb-2 font-medium">Order</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f1f]">
                  {orders.slice(0, 15).map((o) => (
                    <tr key={o.id ?? o.order_number} className="hover:bg-[#171717]">
                      <td className="py-2 font-mono text-[11px] text-[#EFECE6]">{o.order_number ?? '—'}</td>
                      <td className="py-2 text-[#A8A8A8]">{o.customer_name ?? o.email ?? 'Guest'}</td>
                      <td className="py-2 text-[#666666]">{o.created_at ? o.created_at.slice(0, 10) : '—'}</td>
                      <td className="py-2 font-mono text-[#EFECE6]">₹{Number(o.total || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2 text-[#A8A8A8]">{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Events', fmt(summary.totalEvents)],
          ['Purchases', String(summary.purchases)],
          ['Orders', String(summary.totalOrders)],
          ['Revenue', `₹${fmt(summary.totalRevenue)}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-[#292929] bg-[#111111] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#666666]">{label}</p>
            <p className="mt-1 font-display text-2xl text-[#EFECE6]">{value}</p>
          </div>
        ))}
      </div>

      {/* Daily event bars */}
      <div className="rounded-md border border-[#292929] bg-[#111111] p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#666666]">Events per day</p>
        {summary.days.length === 0 ? (
          <p className="text-[13px] text-[#666666]">No data recorded in this date range yet.</p>
        ) : (
          <div className="flex items-end gap-1.5" style={{ height: 120 }}>
            {summary.days.map(([day, count]) => (
              <div key={day} className="flex flex-1 flex-col items-center justify-end gap-1" title={day}>
                <span className="text-[10px] text-[#666666]">{count}</span>
                <div
                  className="w-full rounded-t bg-[#60A5FA]"
                  style={{ height: `${(count / maxDay) * 100}px` }}
                />
                <span className="font-mono-meta text-[8px] text-[#666666]">{day.slice(-5)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event breakdown + funnel */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-[#292929] bg-[#111111] p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#666666]">Event breakdown</p>
          {summary.topEvents.length === 0 ? (
            <p className="text-[13px] text-[#666666]">No events recorded in this date range yet.</p>
          ) : (
            <div className="space-y-2">
              {summary.topEvents.map(([event, count]) => (
                <div key={event} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${EVENT_COLOR[event] ?? 'bg-[#666666]'}`} />
                  <span className="min-w-0 flex-1 truncate text-[12px] text-[#EFECE6]">{EVENT_LABELS[event] ?? event}</span>
                  <span className="font-mono text-[12px] text-[#A8A8A8]">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-md border border-[#292929] bg-[#111111] p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#666666]">Funnel</p>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-[#A8A8A8]">Product Views</span>
              <span className="font-mono text-[#EFECE6]">{summary.topEvents.find(([e]) => e === 'product_view')?.[1] ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A8A8A8]">Add to Cart</span>
              <span className="font-mono text-[#EFECE6]">{summary.topEvents.find(([e]) => e === 'add_to_cart')?.[1] ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A8A8A8]">Begin Checkout</span>
              <span className="font-mono text-[#EFECE6]">{summary.topEvents.find(([e]) => e === 'begin_checkout')?.[1] ?? 0}</span>
            </div>
            <div className="flex justify-between border-t border-[#292929] pt-2">
              <span className="text-[#EFECE6]">Purchase</span>
              <span className="font-mono text-[#B3001B]">{summary.purchases}</span>
            </div>
            <div className="text-[11px] text-[#666666] pt-1">
              View → Purchase: {Math.round((summary.purchases / Math.max(1, summary.topEvents.find(([e]) => e === 'product_view')?.[1] ?? 0)) * 100)}%
            </div>
            <div className="text-[11px] text-[#666666]">
              Checkout → Purchase: {summary.conversion}%
            </div>
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="rounded-md border border-[#292929] bg-[#111111] p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#666666]">Top viewed products</p>
        {summary.topViewedProducts.length === 0 ? (
          <p className="text-[13px] text-[#666666]">No product views recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {summary.topViewedProducts.map(([name, count]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate text-[12px] text-[#EFECE6]">{name}</span>
                <div className="h-2 flex-1 rounded bg-[#292929] overflow-hidden max-w-[200px]">
                  <div className="h-full bg-[#9B6BFF]" style={{ width: `${(count / maxViewedProduct) * 100}%` }} />
                </div>
                <span className="font-mono text-[12px] text-[#A8A8A8]">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent events */}
      <div className="rounded-md border border-[#292929] bg-[#111111] p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#666666]">Recent events</p>
        {events.length === 0 ? (
          <p className="text-[13px] text-[#666666]">No events recorded yet.</p>
        ) : (
          <ul className="divide-y divide-[#292929]">
            {events.slice(0, 20).map((e, i) => (
              <li key={`${e.created_at}-${i}`} className="flex items-center gap-3 py-2">
                <span className={`h-2 w-2 rounded-full ${EVENT_COLOR[e.event] ?? 'bg-[#666666]'}`} />
                <span className="font-mono-meta text-[10px] text-[#A8A8A8]">{e.created_at.slice(0, 19)}</span>
                <span className="text-[12px] text-[#EFECE6]">{EVENT_LABELS[e.event] ?? e.event}</span>
                <span className="min-w-0 flex-1 truncate text-[11px] text-[#666666]">{e.page_url ?? '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
