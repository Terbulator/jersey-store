'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface Variant {
  id: string;
  size: string;
  color: string | null;
  sku: string | null;
  price: number | null;
  stock: number;
  low_stock_threshold: number;
}

const inputCls =
  'w-full rounded-md border border-[#292929] bg-[#0D0D0D] px-2.5 py-1.5 text-[12px] text-[#EFECE6] placeholder:text-[#666666] focus:border-[#B3001B] focus:outline-none';

// Per-product variant manager: size, color, SKU, price override, and stock.
// Stock-only bulk editing stays in Store → Inventory.
export function VariantsManager({ productId, initial }: { productId: string; initial: Variant[] }) {
  const [rows, setRows] = useState<Variant[]>(initial);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState({ size: '', color: '', sku: '', price: '', stock: '10' });
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState('');

  const edit = (id: string, k: string, v: string) =>
    setDraft((d) => ({ ...d, [`${id}.${k}`]: v }));

  const val = (r: Variant, k: keyof Variant, fallback: string) =>
    draft[`${r.id}.${k}`] ?? (r[k] == null ? fallback : String(r[k]));

  function dirty(r: Variant) {
    return (['size', 'color', 'sku', 'price', 'stock', 'low_stock_threshold'] as const).some(
      (k) => draft[`${r.id}.${k}`] !== undefined && draft[`${r.id}.${k}`] !== String(r[k] ?? (k === 'stock' ? 0 : ''))
    );
  }

  async function saveRow(r: Variant) {
    setBusy(r.id);
    setError('');
    const body: Record<string, unknown> = { id: r.id };
    for (const k of ['size', 'color', 'sku', 'price', 'stock', 'low_stock_threshold'] as const) {
      const raw = draft[`${r.id}.${k}`];
      if (raw === undefined) continue;
      body[k] = raw === '' && (k === 'color' || k === 'sku' || k === 'price') ? null : ['price', 'stock', 'low_stock_threshold'].includes(k) ? Number(raw) : raw;
    }
    try {
      const res = await fetch('/api/admin/variants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error ?? 'Could not save variant.');
      setRows((rs) =>
        rs.map((x) =>
          x.id === r.id
            ? {
                ...x,
                size: draft[`${r.id}.size`] ?? x.size,
                color: draft[`${r.id}.color`] ?? x.color,
                sku: draft[`${r.id}.sku`] ?? x.sku,
                price: draft[`${r.id}.price`] !== undefined ? (draft[`${r.id}.price`] === '' ? null : Number(draft[`${r.id}.price`])) : x.price,
                stock: draft[`${r.id}.stock`] !== undefined ? Number(draft[`${r.id}.stock`]) : x.stock,
                low_stock_threshold: draft[`${r.id}.low_stock_threshold`] !== undefined ? Number(draft[`${r.id}.low_stock_threshold`]) : x.low_stock_threshold,
              }
            : x
        )
      );
      setDraft((d) => {
        const next = { ...d };
        for (const k of Object.keys(next)) if (k.startsWith(`${r.id}.`)) delete next[k];
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save variant.');
    }
    setBusy(null);
  }

  async function add() {
    if (!adding.size.trim()) return;
    setBusy('new');
    setError('');
    try {
      const res = await fetch('/api/admin/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          size: adding.size.trim(),
          color: adding.color.trim() || undefined,
          sku: adding.sku.trim() || undefined,
          price: adding.price === '' ? undefined : Number(adding.price),
          stock: Number(adding.stock) || 0,
        }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error ?? 'Could not add variant.');
      setRows((rs) => [
        ...rs,
        {
          id: j.id,
          size: adding.size.trim(),
          color: adding.color.trim() || null,
          sku: adding.sku.trim() || null,
          price: adding.price === '' ? null : Number(adding.price),
          stock: Number(adding.stock) || 0,
          low_stock_threshold: 5,
        },
      ]);
      setAdding({ size: '', color: '', sku: '', price: '', stock: '10' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add variant.');
    }
    setBusy(null);
  }

  async function remove(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
      return;
    }
    setConfirmDelete(null);
    const res = await fetch('/api/admin/variants', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      setError('Could not delete variant.');
      return;
    }
    setRows((rs) => rs.filter((r) => r.id !== id));
  }

  return (
    <section className="space-y-3 rounded-md border border-[#292929] bg-[#111111] p-5">
      <h2 className="font-mono-meta text-[10px] text-off-white/50 uppercase tracking-[0.18em]">
        Variants — {rows.length}
      </h2>
      {rows.length === 0 && <p className="text-[12px] text-[#666666]">No variants yet — add sizes below.</p>}
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-2 gap-2 rounded-md border border-[#292929] p-2.5 sm:grid-cols-7 sm:items-end">
            <div>
              <label className="font-mono-meta text-[9px] text-off-white/40 uppercase">Size</label>
              <input value={val(r, 'size', '')} onChange={(e) => edit(r.id, 'size', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="font-mono-meta text-[9px] text-off-white/40 uppercase">Color</label>
              <input value={val(r, 'color', '')} onChange={(e) => edit(r.id, 'color', e.target.value)} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="font-mono-meta text-[9px] text-off-white/40 uppercase">SKU</label>
              <input value={val(r, 'sku', '')} onChange={(e) => edit(r.id, 'sku', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="font-mono-meta text-[9px] text-off-white/40 uppercase">Price ₹</label>
              <input type="number" min={0} value={val(r, 'price', '')} onChange={(e) => edit(r.id, 'price', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="font-mono-meta text-[9px] text-off-white/40 uppercase">Stock</label>
              <input type="number" min={0} value={val(r, 'stock', '0')} onChange={(e) => edit(r.id, 'stock', e.target.value)} className={inputCls} />
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => saveRow(r)}
                disabled={!dirty(r) || busy === r.id}
                className="flex-1 rounded-md bg-[#B3001B] px-2 py-1.5 text-[11px] font-semibold text-[#EFECE6] disabled:opacity-40"
              >
                {busy === r.id ? '…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => remove(r.id)}
                className={`rounded-md border px-2 py-1.5 text-[11px] ${confirmDelete === r.id ? 'border-[#EF4444] text-[#EF4444]' : 'border-[#292929] text-[#A8A8A8]'}`}
                aria-label="Delete variant"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 rounded-md border border-dashed border-[#292929] p-2.5 sm:grid-cols-6 sm:items-end">
        <div>
          <label className="font-mono-meta text-[9px] text-off-white/40 uppercase">Size *</label>
          <input value={adding.size} onChange={(e) => setAdding((a) => ({ ...a, size: e.target.value }))} placeholder="M" className={inputCls} />
        </div>
        <div>
          <label className="font-mono-meta text-[9px] text-off-white/40 uppercase">Color</label>
          <input value={adding.color} onChange={(e) => setAdding((a) => ({ ...a, color: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className="font-mono-meta text-[9px] text-off-white/40 uppercase">SKU</label>
          <input value={adding.sku} onChange={(e) => setAdding((a) => ({ ...a, sku: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className="font-mono-meta text-[9px] text-off-white/40 uppercase">Price ₹</label>
          <input type="number" min={0} value={adding.price} onChange={(e) => setAdding((a) => ({ ...a, price: e.target.value }))} placeholder="Same as product" className={inputCls} />
        </div>
        <div>
          <label className="font-mono-meta text-[9px] text-off-white/40 uppercase">Stock</label>
          <input type="number" min={0} value={adding.stock} onChange={(e) => setAdding((a) => ({ ...a, stock: e.target.value }))} className={inputCls} />
        </div>
        <button
          type="button"
          onClick={add}
          disabled={!adding.size.trim() || busy === 'new'}
          className="flex items-center justify-center gap-1 rounded-md bg-[#B3001B] px-2 py-1.5 text-[11px] font-semibold text-[#EFECE6] disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> {busy === 'new' ? '…' : 'Add'}
        </button>
      </div>
      {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
    </section>
  );
}
