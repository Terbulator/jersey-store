'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Vendor {
  id: string;
  storeName: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  banner?: string | null;
  commissionRate: number;
  status: string;
}

export default function OwnerSettings() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [form, setForm] = useState({ storeName: '', description: '', logo: '', banner: '' });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch('/api/owner/settings');
    const d = await res.json();
    const v = d.vendor;
    if (v) {
      setVendor(v);
      setForm({ storeName: v.storeName, description: v.description ?? '', logo: v.logo ?? '', banner: v.banner ?? '' });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!form.storeName) {
      toast.error('Store name is required');
      return;
    }
    const res = await fetch('/api/owner/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success('Settings saved');
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to save');
    }
  };

  if (loading) return <div className="h-40 w-full skeleton rounded-xl" />;
  if (!vendor) return <p className="text-sm text-muted-foreground">Store not found.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Store settings</h1>

      <div className="grid gap-4 rounded-xl border p-5">
        <div className="grid gap-2">
          <Label>Store name *</Label>
          <Input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Store slug</Label>
          <Input value={vendor.slug} disabled />
          <p className="text-xs text-muted-foreground">Auto-generated when the store name changes.</p>
        </div>
        <div className="grid gap-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Logo URL</Label>
          <Input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Banner URL</Label>
          <Input value={form.banner} onChange={(e) => setForm({ ...form, banner: e.target.value })} />
        </div>
        <div className="rounded-lg bg-muted/50 p-4 text-sm">
          Commission rate: <span className="font-medium">{Math.round(vendor.commissionRate * 100)}%</span> · Status:{' '}
          <span className="font-medium">{vendor.status}</span>
        </div>
        <Button onClick={handleSave} className="w-fit">Save changes</Button>
      </div>
    </div>
  );
}
