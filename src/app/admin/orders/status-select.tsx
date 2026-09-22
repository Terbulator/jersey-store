'use client';

import { useState } from 'react';

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export function StatusSelect({ orderId, current }: { orderId: string; current: string }) {
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);

  async function update(next: string) {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    if (res.ok) setValue(next);
    else alert('Could not update order status.');
  }

  return (
    <div className="relative">
      <select
        value={value}
        disabled={saving}
        onChange={(e) => update(e.target.value)}
        className="rounded-md border border-[#292929] bg-[#0D0D0D] px-1.5 py-1 text-[10px] uppercase tracking-wide text-[#A8A8A8] focus:outline-none disabled:opacity-50"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {saving && s === value ? 'Saving…' : s}
          </option>
        ))}
      </select>
    </div>
  );
}