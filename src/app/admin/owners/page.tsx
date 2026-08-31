'use client';

import { useCallback, useEffect, useState } from 'react';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OwnerRow {
  id: string;
  storeName: string;
  slug: string;
  description?: string | null;
  commissionRate: number;
  status: string;
  user: { id: string; email: string; name: string | null };
  _count: { products: number; payouts: number };
}

const STATUSES = ['PENDING', 'APPROVED', 'SUSPENDED'];

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};

export default function AdminOwners() {
  const [rows, setRows] = useState<OwnerRow[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}` : '';
    const res = await fetch(`/api/admin/owners${params}`);
    const data = await res.json();
    setRows(data.owners ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (vendorId: string, status: string) => {
    const res = await fetch('/api/admin/owners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId, status }),
    });
    if (res.ok) {
      toast.success('Owner status updated');
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Owners</h1>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="h-32 w-full skeleton rounded-xl" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No owners found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Store</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Commission</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.storeName}</p>
                    <p className="text-xs text-muted-foreground">/{o.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{o.user.name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{o.user.email}</p>
                  </td>
                  <td className="px-4 py-3">{Math.round(o.commissionRate * 100)}%</td>
                  <td className="px-4 py-3">{o._count.products}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge className={cn('border-0', statusColor[o.status] ?? 'bg-gray-200 text-gray-700')}>
                        {o.status}
                      </Badge>
                      <Select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="h-8 w-32"
                        aria-label="Change status"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </Select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
