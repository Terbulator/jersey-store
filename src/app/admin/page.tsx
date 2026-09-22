import Link from 'next/link';
import { DollarSign, ShoppingCart, Package, Users, ArrowUpRight, IndianRupee } from 'lucide-react';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { ADMIN_TOKEN } from '@/lib/admin-nav';

async function getStats() {
  const sb = await adminDataClient();
  const [ordersRes, productsRes] = await Promise.all([
    sb.from('orders').select('total, status, payment_status, created_at').limit(1000),
    sb.from('products').select('id', { count: 'exact', head: true }),
  ]);
  const orders = (ordersRes.data ?? []) as { total: string; status: string; payment_status: string; created_at: string }[];
  const validOrders = orders.filter((o) => o.status !== 'CANCELLED' && o.payment_status === 'PAID');
  const revenue = validOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
  return {
    revenue,
    orderCount: orders.length,
    validOrderCount: validOrders.length,
    pendingOrders,
    productCount: productsRes.count ?? 0,
    aov: validOrders.length ? revenue / validOrders.length : 0,
    recentOrders: orders.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5),
  };
}

function StatCard({ label, value, sub, icon: Icon, accent = ADMIN_TOKEN.accent }: {
  label: string; value: string; sub: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; accent?: string;
}) {
  return (
    <div className="rounded-md border border-[#292929] bg-[#111111] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest text-[#A8A8A8]">{label}</p>
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </div>
      <p className="mt-2 font-display text-3xl text-[#EFECE6]">{value}</p>
      <p className="mt-1 text-[11px] text-[#666666]">{sub}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const { user } = await requireAdmin();
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-[#EFECE6]">Command Center</h1>
          <p className="mt-1 text-[13px] text-[#A8A8A8]">
            Welcome back — everything from one place.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="flex items-center gap-1.5 rounded-md bg-[#B3001B] px-3 py-2 text-[12px] font-semibold text-[#EFECE6] transition-opacity hover:opacity-90"
        >
          Manage products
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} sub={`${stats.validOrderCount} paid orders`} icon={IndianRupee} />
        <StatCard label="Orders" value={String(stats.orderCount)} sub={`${stats.pendingOrders} pending`} icon={ShoppingCart} accent={ADMIN_TOKEN.info} />
        <StatCard label="Products Sold" value="—" sub="Requires item-level tracking" icon={Package} accent={ADMIN_TOKEN.warning} />
        <StatCard label="Products" value={String(stats.productCount)} sub="in catalog" icon={Package} accent={ADMIN_TOKEN.success} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-[#292929] bg-[#111111] lg:col-span-2">
          <div className="border-b border-[#292929] px-4 py-3">
            <h2 className="text-[13px] font-semibold text-[#EFECE6]">Revenue</h2>
            <p className="text-[11px] text-[#666666]">Rolling from real orders</p>
          </div>
          <div className="flex h-48 items-center justify-center px-4 text-[12px] text-[#666666]">
            {stats.revenue === 0
              ? 'No paid orders yet — revenue will appear here once orders come in.'
              : `₹${stats.revenue.toLocaleString('en-IN')} total revenue`}
          </div>
        </div>

        <div className="rounded-md border border-[#292929] bg-[#111111]">
          <div className="border-b border-[#292929] px-4 py-3">
            <h2 className="text-[13px] font-semibold text-[#EFECE6]">Recent Orders</h2>
          </div>
          <div className="divide-y divide-[#292929]">
            {stats.recentOrders.length === 0 && (
              <p className="px-4 py-6 text-[12px] text-[#666666]">No orders recorded yet.</p>
            )}
            {stats.recentOrders.map((o, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <p className="text-[12px] text-[#EFECE6]">{o.status}</p>
                  <p className="text-[11px] text-[#666666]">{new Date(o.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <p className="text-[12px] text-[#A8A8A8]">₹{Number(o.total).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}