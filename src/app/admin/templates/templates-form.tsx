'use client';

import { useState } from 'react';
import { Save, Check } from 'lucide-react';
import type { DisplaySettings } from '@/lib/display';

type Status = { kind: 'idle' | 'saving' | 'saved' | 'error'; message?: string };

const inputCls = 'input w-full text-[12px]';

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-md border border-[#292929] bg-[#111111] p-4">
      <h2 className="font-mono-meta text-[10px] text-off-white/50 uppercase tracking-[0.18em]">{title}</h2>
      {hint && <p className="-mt-1 text-[11px] text-[#666666]">{hint}</p>}
      {children}
    </section>
  );
}

function CheckRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-2.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#B3001B]" />
      <span>
        <span className="block text-[13px] text-[#EFECE6]">{label}</span>
        {hint && <span className="block text-[11px] text-[#666666]">{hint}</span>}
      </span>
    </label>
  );
}

function SelectRow({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TemplatesForm({ initial }: { initial: DisplaySettings }) {
  const [form, setForm] = useState<DisplaySettings>(() => JSON.parse(JSON.stringify(initial)) as DisplaySettings);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const setCard = <K extends keyof DisplaySettings['card']>(k: K, v: DisplaySettings['card'][K]) =>
    setForm((f) => ({ ...f, card: { ...f.card, [k]: v } }));
  const setDetail = <K extends keyof DisplaySettings['detail']>(k: K, v: DisplaySettings['detail'][K]) =>
    setForm((f) => ({ ...f, detail: { ...f.detail, [k]: v } }));
  const setCollection = <K extends keyof DisplaySettings['collection']>(k: K, v: DisplaySettings['collection'][K]) =>
    setForm((f) => ({ ...f, collection: { ...f.collection, [k]: v } }));

  async function save() {
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates: form }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus({ kind: 'error', message: j?.error ?? 'Could not save templates.' });
        return;
      }
      setStatus({ kind: 'saved', message: 'Templates saved — live across the storefront.' });
    } catch {
      setStatus({ kind: 'error', message: 'Network error — try again.' });
    }
  }

  return (
    <div className="max-w-2xl space-y-4 pb-10">
      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={!dirty || status.kind === 'saving'}
          className="flex items-center gap-1.5 rounded-md bg-[#B3001B] px-3 py-1.5 text-[12px] font-semibold text-[#EFECE6] hover:bg-[#d40022] disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" /> {status.kind === 'saving' ? 'Saving…' : 'Save Templates'}
        </button>
        {status.kind === 'saved' && (
          <span className="flex items-center gap-1 text-[12px] text-[#4ADE80]">
            <Check className="h-3.5 w-3.5" /> {status.message}
          </span>
        )}
        {status.kind === 'error' && <span className="text-[12px] text-[#EF4444]">{status.message}</span>}
      </div>

      <Card title="Product card" hint="Every card in grids, best sellers, editions, and related products.">
        <SelectRow
          label="Image ratio"
          value={form.card.image_ratio}
          options={[
            { value: '3/4', label: 'Portrait (3:4)' },
            { value: '1/1', label: 'Square (1:1)' },
            { value: '4/5', label: 'Portrait (4:5)' },
          ]}
          onChange={(v) => setCard('image_ratio', v)}
        />
        <SelectRow
          label="Badge shape"
          value={form.card.badge_style}
          options={[
            { value: 'pill', label: 'Pill' },
            { value: 'square', label: 'Square' },
          ]}
          onChange={(v) => setCard('badge_style', v)}
        />
        <div>
          <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Corner radius (px)</label>
          <input type="number" min={0} max={32} value={form.card.radius} onChange={(e) => setCard('radius', Number(e.target.value))} className={inputCls} />
        </div>
        <CheckRow label="Second image on hover" checked={form.card.show_second_image} onChange={(v) => setCard('show_second_image', v)} />
        <CheckRow label="Wishlist heart" checked={form.card.show_wishlist} onChange={(v) => setCard('show_wishlist', v)} />
        <CheckRow label="Quick Add button" checked={form.card.show_quick_add} onChange={(v) => setCard('show_quick_add', v)} />
        <CheckRow label="Compare-at price" checked={form.card.show_compare} onChange={(v) => setCard('show_compare', v)} />
        <CheckRow label="Short description" checked={form.card.show_description} onChange={(v) => setCard('show_description', v)} />
      </Card>

      <Card title="Product page" hint="Every /shop/products/… page.">
        <SelectRow
          label="Gallery thumbnails"
          value={form.detail.thumbs_position}
          options={[
            { value: 'below', label: 'Below the image' },
            { value: 'side', label: 'Beside the image' },
          ]}
          onChange={(v) => setDetail('thumbs_position', v)}
        />
        <CheckRow label="Quantity selector" checked={form.detail.show_quantity} onChange={(v) => setDetail('show_quantity', v)} />
        <CheckRow label="Buy Now button" hint="Checkout skipping the cart." checked={form.detail.show_buy_now} onChange={(v) => setDetail('show_buy_now', v)} />
        <CheckRow label="Shipping & Returns section" checked={form.detail.show_shipping} onChange={(v) => setDetail('show_shipping', v)} />
        <CheckRow label="Trust badges" hint="Shipping, returns, secure checkout, support." checked={form.detail.show_trust} onChange={(v) => setDetail('show_trust', v)} />
        <CheckRow label="Info accordions" hint="Description, fit, material, care." checked={form.detail.show_accordions} onChange={(v) => setDetail('show_accordions', v)} />
        <div>
          <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Related products heading</label>
          <input value={form.detail.related_title} onChange={(e) => setDetail('related_title', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Related products count (0 hides)</label>
          <input type="number" min={0} max={8} value={form.detail.related_count} onChange={(e) => setDetail('related_count', Number(e.target.value))} className={inputCls} />
        </div>
      </Card>

      <Card title="Collection grid" hint="Shop, Football, Cricket, and Streetwear listing pages.">
        <SelectRow
          label="Columns — desktop"
          value={String(form.collection.columns_desktop)}
          options={[
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
          ]}
          onChange={(v) => setCollection('columns_desktop', Number(v))}
        />
        <SelectRow
          label="Columns — mobile"
          value={String(form.collection.columns_mobile)}
          options={[
            { value: '1', label: '1' },
            { value: '2', label: '2' },
          ]}
          onChange={(v) => setCollection('columns_mobile', Number(v))}
        />
        <CheckRow label="Result count line" checked={form.collection.show_count} onChange={(v) => setCollection('show_count', v)} />
        <CheckRow label="Filter button" checked={form.collection.show_filters} onChange={(v) => setCollection('show_filters', v)} />
        <CheckRow label="Sort dropdown" checked={form.collection.show_sort} onChange={(v) => setCollection('show_sort', v)} />
      </Card>
    </div>
  );
}
