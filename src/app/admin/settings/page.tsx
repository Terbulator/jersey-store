'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const DEFAULT_KEYS = [
  { key: 'siteName', label: 'Site name', type: 'text' },
  { key: 'currency', label: 'Currency', type: 'text' },
  { key: 'taxRate', label: 'Tax rate (e.g. 0.18)', type: 'number' },
  { key: 'shippingFee', label: 'Shipping fee', type: 'number' },
  { key: 'freeShippingThreshold', label: 'Free shipping over', type: 'number' },
];

export default function AdminSettings() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        const v: Record<string, string> = {};
        for (const k of DEFAULT_KEYS) {
          const existing = d.settings?.[k.key];
          v[k.key] = existing === undefined || existing === null ? '' : String(existing);
        }
        setValues(v);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const body: Record<string, unknown> = {};
    for (const k of DEFAULT_KEYS) {
      if (values[k.key] !== '') {
        body[k.key] = k.type === 'number' ? Number(values[k.key]) : values[k.key];
      }
    }
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Settings saved');
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to save settings');
    }
  };

  if (loading) return <div className="h-32 w-full skeleton rounded-xl" />;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Store settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {DEFAULT_KEYS.map((f) => (
              <div key={f.key} className="grid gap-2">
                <Label htmlFor={`s-${f.key}`}>{f.label}</Label>
                <Input
                  id={`s-${f.key}`}
                  type={f.type === 'number' ? 'number' : 'text'}
                  value={values[f.key] ?? ''}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
