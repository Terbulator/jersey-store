'use client';

import { useCallback, useEffect, useState } from 'react';
import { IndianRupee, ShoppingCart, Package, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface Report {
  days: number;
  revenue: number;
  orders: number;
  aov: number;
  products: number;
  customers: number;
  daily: { date: string; orders: number; revenue: number }[];
}

const RANGES = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
];

export default function AdminReports() {
  const [data, setData] = useState<Report | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/reports?days=${days}`);
    const d = await res.json();
    setData(d);
    setLoading(false);
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const maxRevenue = data ? Math.max(1, ...data.daily.map((d) => d.revenue)) : 1;

  const cards = [
    { label: 'Revenue', value: data ? formatPrice(data.revenue) : '—', icon: IndianRupee },
    { label: 'Orders', value: data ? String(data.orders) : '—', icon: ShoppingCart },
    { label: 'Avg order value', value: data ? formatPrice(data.aov) : '—', icon: IndianRupee },
    { label: 'Live products', value: data ? String(data.products) : '—', icon: Package },
    { label: 'Customers', value: data ? String(data.customers) : '—', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Sales Report</h1>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <Button
              key={r.value}
              variant={days === r.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map((c) => (
              <Card key={c.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{c.label}</p>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <c.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-xl font-bold">{c.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by day</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.daily.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No data in this range.</p>
              ) : (
                data.daily.slice().reverse().map((d) => (
                  <div key={d.date} className="flex items-center gap-3 text-sm">
                    <span className="w-20 shrink-0 text-muted-foreground">{d.date}</span>
                    <div className="h-6 flex-1 overflow-hidden rounded bg-muted/60">
                      <div
                        className="h-full rounded bg-primary/70"
                        style={{ width: `${(d.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="w-24 shrink-0 text-right font-medium">{formatPrice(d.revenue)}</span>
                    <span className="w-10 shrink-0 text-right text-muted-foreground">×{d.orders}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
