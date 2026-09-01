'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Users, Package, ShoppingCart, Building2, IndianRupee, ScrollText, FileClock,
  LifeBuoy, Megaphone, Tag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, cn } from '@/lib/utils';

interface Stats {
  userCount: number;
  ownerCount: number;
  workerCount: number;
  productCount: number;
  orderCount: number;
  revenue: number;
  auditCount: number;
  openTicketCount: number;
  pendingResellerCount: number;
  activeCouponCount: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    customer: string;
    createdAt: string;
  }[];
}

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-200 text-gray-800',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/stats');
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || 'Failed to load stats');
      return;
    }
    setStats(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="text-destructive">{error}</p>;
  if (!stats) return <div className="h-40 w-full skeleton rounded-xl" />;

  const cards = [
    { label: 'Users', value: stats.userCount, icon: Users, href: '/admin/users' },
    { label: 'Owners', value: stats.ownerCount, icon: Building2, href: '/admin/owners' },
    { label: 'Products', value: stats.productCount, icon: Package, href: '/admin/products' },
    { label: 'Orders', value: stats.orderCount, icon: ShoppingCart, href: '/admin/orders' },
    { label: 'Revenue', value: formatPrice(stats.revenue), icon: IndianRupee, href: '/admin/orders' },
    { label: 'Open tickets', value: stats.openTicketCount, icon: LifeBuoy, href: '/admin/tickets' },
    { label: 'Pending resellers', value: stats.pendingResellerCount, icon: Megaphone, href: '/admin/resellers' },
    { label: 'Active coupons', value: stats.activeCouponCount, icon: Tag, href: '/admin/coupons' },
    { label: 'Audit events', value: stats.auditCount, icon: ScrollText, href: '/admin/audit' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="text-2xl font-bold">{c.value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileClock className="h-5 w-5" /> Recent orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Order</th>
                    <th className="pb-2 pr-4 font-medium">Customer</th>
                    <th className="pb-2 pr-4 font-medium">Total</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((o) => (
                    <tr key={o.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{o.orderNumber}</td>
                      <td className="py-3 pr-4">{o.customer}</td>
                      <td className="py-3 pr-4">{formatPrice(o.total)}</td>
                      <td className="py-3 pr-4">
                        <Badge className={cn('border-0', statusColor[o.status] ?? 'bg-gray-200 text-gray-800')}>
                          {o.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
