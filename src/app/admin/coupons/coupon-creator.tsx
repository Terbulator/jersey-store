'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

const inputClass =
  'w-full rounded-md border border-[#292929] bg-[#0D0D0D] px-3 py-2 text-[13px] text-[#EFECE6] placeholder:text-[#666666] focus:border-[#B3001B] focus:outline-none';

export function CouponCreator() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', min_spend: '', max_discount: '', max_uses: '' });
  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          value: Number(form.value) || 0,
          min_spend: form.min_spend ? Number(form.min_spend) : null,
          max_discount: form.max_discount ? Number(form.max_discount) : null,
          max_uses: form.max_uses ? Number(form.max_uses) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create coupon.');
      setForm({ code: '', type: 'percent', value: '', min_spend: '', max_discount: '', max_uses: '' });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md bg-[#B3001B] px-3 py-2 text-[12px] font-semibold text-[#EFECE6] transition-opacity hover:opacity-90"
      >
        <Plus className="h-3.5 w-3.5" />
        New coupon
      </button>

      {open && (
        <form onSubmit={submit} className="mt-4 space-y-4 rounded-md border border-[#292929] bg-[#111111] p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest text-[#A8A8A8]">Code *</label>
              <input className={inputClass} value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} required placeholder="SUMMER20" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest text-[#A8A8A8]">Type</label>
              <select className={inputClass} value={form.type} onChange={(e) => set('type', e.target.value)}>
                <option value="percent">Percent</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest text-[#A8A8A8]">Value *</label>
              <input className={inputClass} type="number" value={form.value} onChange={(e) => set('value', e.target.value)} required placeholder={form.type === 'percent' ? '20' : '500'} />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest text-[#A8A8A8]">Min spend</label>
              <input className={inputClass} type="number" value={form.min_spend} onChange={(e) => set('min_spend', e.target.value)} placeholder="999" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest text-[#A8A8A8]">Max discount</label>
              <input className={inputClass} type="number" value={form.max_discount} onChange={(e) => set('max_discount', e.target.value)} placeholder="500" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest text-[#A8A8A8]">Max uses</label>
              <input className={inputClass} type="number" value={form.max_uses} onChange={(e) => set('max_uses', e.target.value)} placeholder="100" />
            </div>
          </div>
          {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
          <button type="submit" disabled={saving} className="rounded-md bg-[#B3001B] px-4 py-2 text-[12px] font-semibold text-[#EFECE6] disabled:opacity-50">
            {saving ? 'Creating…' : 'Create coupon'}
          </button>
        </form>
      )}
    </div>
  );
}