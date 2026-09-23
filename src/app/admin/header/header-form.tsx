'use client';

import { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { ImageUploader } from '@/components/admin/image-uploader';
import type { HeaderSettings } from '@/lib/site-chrome';

import type { FormStatus as Status } from '@/lib/admin-ui';

import { formInputCls as inputCls } from '@/lib/admin-ui';

import { CheckRow } from '@/lib/admin-ui';

export function HeaderForm({ initial }: { initial: HeaderSettings }) {
  const [form, setForm] = useState<HeaderSettings>({ ...initial });
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const set = <K extends keyof HeaderSettings>(k: K, v: HeaderSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  async function save() {
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ header: form }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus({ kind: 'error', message: j?.error ?? 'Could not save header.' });
        return;
      }
      setStatus({ kind: 'saved', message: 'Header saved — live across the storefront.' });
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
          <Save className="h-3.5 w-3.5" /> {status.kind === 'saving' ? 'Saving…' : 'Save Header'}
        </button>
        {status.kind === 'saved' && (
          <span className="flex items-center gap-1 text-[12px] text-[#4ADE80]">
            <Check className="h-3.5 w-3.5" /> {status.message}
          </span>
        )}
        {status.kind === 'error' && <span className="text-[12px] text-[#EF4444]">{status.message}</span>}
      </div>

      <section className="space-y-3 rounded-md border border-[#292929] bg-[#111111] p-4">
        <h2 className="font-mono-meta text-[10px] text-off-white/50 uppercase tracking-[0.18em]">Logo</h2>
        <div>
          <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Logo image</label>
          <ImageUploader value={form.logo} onChange={(url) => set('logo', url)} onRemove={() => set('logo', '')} folder="header" />
          <p className="mt-1 text-[10px] text-[#666666]">Shown instead of the text logo when set.</p>
        </div>
        <div>
          <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Logo text</label>
          <input value={form.logo_text} onChange={(e) => set('logo_text', e.target.value)} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Logo size (px)</label>
            <input type="number" min={16} max={64} value={form.logo_size} onChange={(e) => set('logo_size', Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Tagline</label>
            <input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="EST. 2026" className={inputCls} />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-md border border-[#292929] bg-[#111111] p-4">
        <h2 className="font-mono-meta text-[10px] text-off-white/50 uppercase tracking-[0.18em]">Behavior & style</h2>
        <CheckRow label="Sticky header" hint="Stay pinned to the top while scrolling." checked={form.sticky} onChange={(v) => set('sticky', v)} />
        <CheckRow label="Transparent at top" hint="No background until the page scrolls." checked={form.transparent_top} onChange={(v) => set('transparent_top', v)} />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Background</label>
            <input value={form.bg} onChange={(e) => set('bg', e.target.value)} placeholder="Default" className={inputCls} />
          </div>
          <div>
            <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Link color</label>
            <input value={form.link_color} onChange={(e) => set('link_color', e.target.value)} placeholder="Default" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Navigation spacing (px)</label>
          <input type="number" min={0} max={64} value={form.nav_gap} onChange={(e) => set('nav_gap', Number(e.target.value))} className={inputCls} />
        </div>
      </section>

      <section className="space-y-3 rounded-md border border-[#292929] bg-[#111111] p-4">
        <h2 className="font-mono-meta text-[10px] text-off-white/50 uppercase tracking-[0.18em]">Header icons</h2>
        <CheckRow label="Search" checked={form.show_search} onChange={(v) => set('show_search', v)} />
        <CheckRow label="Account" checked={form.show_account} onChange={(v) => set('show_account', v)} />
        <CheckRow label="Wishlist" checked={form.show_wishlist} onChange={(v) => set('show_wishlist', v)} />
        <CheckRow label="Cart" checked={form.show_cart} onChange={(v) => set('show_cart', v)} />
      </section>
    </div>
  );
}
