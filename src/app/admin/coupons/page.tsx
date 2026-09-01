'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  percentOff: number;
  maxDiscount: number | null;
  minSubtotal: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
}

const EMPTY = {
  code: '',
  percentOff: '10',
  maxDiscount: '',
  minSubtotal: '0',
  maxUses: '',
  description: '',
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/coupons');
    const d = await res.json();
    setCoupons(d.coupons ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error('Code is required');
      return;
    }
    setSubmitting(true);
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        percentOff: Number(form.percentOff),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        minSubtotal: Number(form.minSubtotal || 0),
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        description: form.description || undefined,
      }),
    });
    if (res.ok) {
      toast.success('Coupon created');
      setForm(EMPTY);
      setShowForm(false);
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to create');
    }
    setSubmitting(false);
  };

  const toggle = async (c: Coupon) => {
    const res = await fetch(`/api/admin/coupons/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !c.active }),
    });
    if (res.ok) {
      toast.success(c.active ? 'Coupon disabled' : 'Coupon enabled');
      load();
    } else {
      toast.error('Failed to update');
    }
  };

  const remove = async (c: Coupon) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    const res = await fetch(`/api/admin/coupons/${c.id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Coupon deleted');
      load();
    } else {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> New coupon
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={create} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SAVE10" />
              </div>
              <div>
                <Label>Percent off</Label>
                <Input type="number" min={1} max={100} value={form.percentOff} onChange={(e) => setForm({ ...form, percentOff: e.target.value })} />
              </div>
              <div>
                <Label>Max discount (optional)</Label>
                <Input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="500" />
              </div>
              <div>
                <Label>Min subtotal</Label>
                <Input type="number" value={form.minSubtotal} onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })} />
              </div>
              <div>
                <Label>Max uses (optional)</Label>
                <Input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="100" />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create coupon'}</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="h-40 w-full skeleton rounded-xl" />
      ) : coupons.length === 0 ? (
        <div className="rounded-xl border py-12 text-center text-muted-foreground">
          <Tag className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No coupons yet. Create one to offer discounts.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Min subtotal</th>
                <th className="px-4 py-3 font-medium">Uses</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{c.code}</td>
                  <td className="px-4 py-3">
                    {c.percentOff}%{c.maxDiscount ? ` (max ${formatPrice(c.maxDiscount)})` : ''}
                  </td>
                  <td className="px-4 py-3">{formatPrice(c.minSubtotal)}</td>
                  <td className="px-4 py-3">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(c)}>
                      <Badge className={cn('border-0 cursor-pointer', c.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700')}>
                        {c.active ? 'Active' : 'Disabled'}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggle(c)} title={c.active ? 'Disable' : 'Enable'}>
                        {c.active ? 'Disable' : 'Enable'}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(c)}><Trash2 className="h-4 w-4" /></Button>
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
