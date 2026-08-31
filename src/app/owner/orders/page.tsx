'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatPrice, cn } from '@/lib/utils';

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  customer: string;
  email?: string;
  itemCount: number;
  total: number;
  createdAt: string;
}

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-200 text-gray-800',
};

export default function OwnerOrders() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (query) params.set('search', query);
    if (status) params.set('status', status);
    const res = await fetch(`/api/owner/orders?${params}`);
    const data = await res.json();
    setRows(data.orders ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, size, query, status]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40">
            <option value="">All statuses</option>
            {Object.keys(statusColor).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <form className="relative flex-1 sm:max-w-xs" onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search); }}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order #…" className="pl-9" />
          </form>
        </div>
      </div>

      {loading ? (
        <div className="h-40 w-full skeleton rounded-xl" />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : (
                rows.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                    <td className="px-4 py-3">{o.customer}</td>
                    <td className="px-4 py-3">{o.itemCount}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn('border-0', statusColor[o.status] ?? 'bg-gray-200 text-gray-800')}>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} of {totalPages} · {total} orders</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
