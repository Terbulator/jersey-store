'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

export function ShippingForm({ initial }: { initial: { free_threshold?: number; rate?: number; message?: string } }) {
  const router = useRouter();
  const [form, setForm] = useState({
    freeThreshold: String(initial.free_threshold ?? 999),
    rate: String(initial.rate ?? 99),
    message: initial.message ?? 'Free shipping on orders above ₹999',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setError('');
    setSaved(false);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shipping: {
          free_threshold: Number(form.freeThreshold) || 0,
          rate: Number(form.rate) || 0,
          message: form.message.trim(),
        },
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError('Could not save.');
      return;
    }
    setSaved(true);
    router.refresh();
  }

  const inputCls =
    'mt-1 w-full rounded-md border border-[#292929] bg-[#0D0D0D] px-2.5 py-1.5 text-[13px] text-[#EFECE6] placeholder:text-[#666666] focus:border-[#B3001B] focus:outline-none';

  return (
    <div className="max-w-md rounded-md border border-[#292929] bg-[#111111] p-5">
      <label className="block text-[10px] uppercase tracking-widest text-[#666666]">
        Free shipping threshold (₹)
        <input
          value={form.freeThreshold}
          type="number"
          onChange={(e) => setForm((f) => ({ ...f, freeThreshold: e.target.value }))}
          className={inputCls}
        />
      </label>
      <label className="mt-4 block text-[10px] uppercase tracking-widest text-[#666666]">
        Standard shipping rate (₹)
        <input
          value={form.rate}
          type="number"
          onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
          className={inputCls}
        />
      </label>
      <label className="mt-4 block text-[10px] uppercase tracking-widest text-[#666666]">
        Free-shipping message
        <input
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className={inputCls}
        />
      </label>
      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-md bg-[#B3001B] px-3 py-2 text-[12px] font-semibold text-[#EFECE6] disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saved && <span className="text-[12px] text-[#4ADE80]">Saved</span>}
      </div>
      {error && <p className="mt-2 text-[12px] text-[#EF4444]">{error}</p>}
    </div>
  );
}