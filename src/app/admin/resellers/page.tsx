'use client';

import { useCallback, useEffect, useState } from 'react';
import { Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ResellerRow {
  id: string;
  email: string;
  name: string | null;
  referralCode: string;
  commissionRate: number;
  priceFloor: number;
  priceCeiling: number | null;
  tier: string;
  status: string;
  salesCount: number;
  earned: number;
  createdAt: string;
}

export default function AdminResellers() {
  const [rows, setRows] = useState<ResellerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/resellers');
    const d = await res.json();
    setRows(d.resellers ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (resellerId: string, data: Record<string, unknown>) => {
    const res = await fetch('/api/admin/resellers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resellerId, ...data }),
    });
    if (res.ok) {
      toast.success('Updated');
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to update');
    }
  };

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    SUSPENDED: 'bg-red-100 text-red-800',
  };

  if (loading) return <div className="h-40 w-full skeleton rounded-xl" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Resellers</h1>

      {rows.length === 0 ? (
        <div className="rounded-xl border py-12 text-center text-muted-foreground">
          <Users2 className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No reseller applications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                  <span className="truncate">{r.name ?? r.email}</span>
                  <div className="flex items-center gap-2">
                    <Select value={r.status} onChange={(e) => update(r.id, { status: e.target.value })} className="h-8 w-32">
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </Select>
                    <Badge className={cn('border-0', statusColor[r.status] ?? '')}>{r.status}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">Referral: <strong>{r.referralCode}</strong> · Tier <strong>{r.tier}</strong> · Sales {r.salesCount}</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Commission %</label>
                    <Input
                      type="number"
                      defaultValue={r.commissionRate * 100}
                      onBlur={(e) => { const v = Number(e.target.value) / 100; if (v !== r.commissionRate) update(r.id, { commissionRate: v }); }}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Price floor</label>
                    <Input
                      type="number"
                      defaultValue={r.priceFloor}
                      onBlur={(e) => { const v = Number(e.target.value); if (v !== r.priceFloor) update(r.id, { priceFloor: v }); }}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Price ceiling</label>
                    <Input
                      type="number"
                      defaultValue={r.priceCeiling ?? ''}
                      onBlur={(e) => { const v = e.target.value === '' ? null : Number(e.target.value); if (v !== r.priceCeiling) update(r.id, { priceCeiling: v }); }}
                      className="h-8"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Earned: {formatPrice(r.earned)} · Applied {new Date(r.createdAt).toLocaleDateString()}</p>
                <div className="flex flex-wrap gap-2">
                  {['Bronze', 'Silver', 'Gold', 'Platinum'].map((t) => (
                    <Button key={t} variant={r.tier === t ? 'default' : 'outline'} size="sm" onClick={() => update(r.id, { tier: t })}>
                      {t}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
