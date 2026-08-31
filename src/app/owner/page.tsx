'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Package, ShoppingCart, HardHat, ListChecks, IndianRupee, FileClock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, cn } from '@/lib/utils';

interface Stats {
  productCount: number;
  publishedCount: number;
  workerCount: number;
  taskCount: number;
  pendingTasks: number;
  orderCount: number;
  revenue: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    product: string;
    qty: number;
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

export default function OwnerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/owner/stats');
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
    { label: 'Products', value: stats.productCount, icon: Package, href: '/owner/products' },
    { label: 'Orders', value: stats.orderCount, icon: ShoppingCart, href: '/owner/orders' },
    { label: 'Workers', value: stats.workerCount, icon: HardHat, href: '/owner/workers' },
    { label: 'Tasks', value: stats.taskCount, icon: ListChecks, href: '/owner/tasks' },
    { label: 'Pending tasks', value: stats.pendingTasks, icon: ListChecks, href: '/owner/tasks' },
    { label: 'Revenue', value: formatPrice(stats.revenue), icon: IndianRupee, href: '/owner/orders' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        {stats.publishedCount} of {stats.productCount} products published.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <FileClock className="h-5 w-5" /> Recent order activity
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
                    <th className="pb-2 pr-4 font-medium">Product</th>
                    <th className="pb-2 pr-4 font-medium">Qty</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((o) => (
                    <tr key={`${o.id}-${o.product}`} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{o.orderNumber}</td>
                      <td className="py-3 pr-4">{o.product}</td>
                      <td className="py-3 pr-4">{o.qty}</td>
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
