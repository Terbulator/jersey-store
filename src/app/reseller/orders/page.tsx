'use client';

import { useCallback, useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';

interface OrderItem { name: string; quantity: number; total: number }
interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  total: number;
  coupon: string | null;
  createdAt: string;
  products: OrderItem[];
}

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function ResellerOrders() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/reseller/orders?page=${page}`);
    const d = await res.json();
    setRows(d.orders ?? []);
    setTotal(d.total ?? 0);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referred orders</h1>
        <p className="text-sm text-muted-foreground">Orders placed through your referral link.</p>
      </div>

      {loading ? (
        <div className="h-40 w-full skeleton rounded-xl" />
      ) : rows.length === 0 ? (
        <div className="rounded-xl border py-12 text-center text-muted-foreground">
          <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No referred orders yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Coupon</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    {o.products.map((p) => (
                      <div key={p.name}>{p.name} × {p.quantity}</div>
                    ))}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn('border-0', statusColor[o.status] ?? '')}>{o.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{o.paymentStatus}</td>
                  <td className="px-4 py-3">{o.coupon ?? '—'}</td>
                  <td className="px-4 py-3">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > size && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} of {totalPages}</span>
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
