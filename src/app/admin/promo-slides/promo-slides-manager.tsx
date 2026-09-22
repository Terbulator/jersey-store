'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface SlideRow {
  id: string;
  eyebrow: string | null;
  headline: string;
  subheadline: string | null;
  desktop_image: string | null;
  mobile_image: string | null;
  cta_text: string | null;
  cta_url: string | null;
  status: string;
  active: boolean;
  sort_order: number;
}

const inputClass =
  'w-full rounded-md border border-[#292929] bg-[#0D0D0D] px-3 py-2 text-[13px] text-[#EFECE6] placeholder:text-[#666666] focus:border-[#B3001B] focus:outline-none';

const field = 'space-y-1.5';

export function PromoSlidesManager({ items }: { items: SlideRow[] }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, Partial<SlideRow>>>({});
  const [created, setCreated] = useState({ headline: '', eyebrow: '', subheadline: '', cta_text: '', cta_url: '', desktop_image: '' });

  async function act(id: string, patch: Partial<SlideRow>) {
    setBusy(id);
    const res = await fetch('/api/admin/promo-slides', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
    setBusy(null);
    if (!res.ok) {
      setError('Could not save slide.');
      return;
    }
    setError('');
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch('/api/admin/promo-slides', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) setError('Could not delete slide.');
    else router.refresh();
  }

  async function create() {
    if (!created.headline.trim()) return;
    const res = await fetch('/api/admin/promo-slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...created, headline: created.headline.trim(), cta_url: created.cta_url.trim() || null }),
    });
    if (!res.ok) {
      setError('Could not create slide.');
      return;
    }
    setCreated({ headline: '', eyebrow: '', subheadline: '', cta_text: '', cta_url: '', desktop_image: '' });
    setNewOpen(false);
    router.refresh();
  }

  function draft(id: string, field: keyof SlideRow, value: string) {
    setDrafts((d) => ({ ...d, [id]: { ...(d[id] ?? {}), [field]: value } }));
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setNewOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md bg-[#B3001B] px-3 py-2 text-[12px] font-semibold text-[#EFECE6]"
      >
        <Plus className="h-3.5 w-3.5" />
        New slide
      </button>

      {newOpen && (
        <div className="rounded-md border border-[#292929] bg-[#111111] p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#666666]">New slide</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className={field}>
              <input className={inputClass} placeholder="Headline *" value={created.headline} onChange={(e) => setCreated((c) => ({ ...c, headline: e.target.value }))} />
            </div>
            <div className={field}>
              <input className={inputClass} placeholder="Eyebrow" value={created.eyebrow} onChange={(e) => setCreated((c) => ({ ...c, eyebrow: e.target.value }))} />
            </div>
            <div className={`${field} sm:col-span-2`}>
              <input className={inputClass} placeholder="Subheadline" value={created.subheadline} onChange={(e) => setCreated((c) => ({ ...c, subheadline: e.target.value }))} />
            </div>
            <div className={field}>
              <input className={inputClass} placeholder="CTA text" value={created.cta_text} onChange={(e) => setCreated((c) => ({ ...c, cta_text: e.target.value }))} />
            </div>
            <div className={field}>
              <input className={inputClass} placeholder="CTA URL" value={created.cta_url} onChange={(e) => setCreated((c) => ({ ...c, cta_url: e.target.value }))} />
            </div>
            <div className={`${field} sm:col-span-2`}>
              <input className={inputClass} placeholder="Desktop image URL" value={created.desktop_image} onChange={(e) => setCreated((c) => ({ ...c, desktop_image: e.target.value }))} />
            </div>
          </div>
          <button onClick={create} className="mt-4 rounded-md bg-[#B3001B] px-4 py-2 text-[12px] font-semibold text-[#EFECE6]">
            Create slide
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-md border border-[#292929] bg-[#111111] p-10 text-center">
          <p className="text-[13px] text-[#666666]">No slides yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => {
            const d = drafts[s.id] ?? {};
            const val = (k: keyof SlideRow) => (d[k] as string | null | undefined) ?? s[k];
            const changed = Object.keys(d).length > 0;
            return (
              <div key={s.id} className="rounded-md border border-[#292929] bg-[#111111] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate font-medium text-[#EFECE6]">
                    <span className="text-[11px] text-[#666666]">#{s.sort_order} ·</span> {s.headline || 'Untitled'}
                  </p>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${s.active ? 'bg-[#4ADE80]/15 text-[#4ADE80]' : 'bg-[#292929] text-[#666666]'}`}>
                      {s.active ? 'Live' : s.status}
                    </span>
                    <button
                      onClick={() => act(s.id, { active: !s.active })}
                      disabled={busy === s.id}
                      className="rounded-md border border-[#292929] px-2.5 py-1 text-[11px] text-[#A8A8A8] disabled:opacity-50"
                    >
                      {s.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => act(s.id, { sort_order: s.sort_order - 1 })}
                      aria-label="Move up"
                      className="rounded-md border border-[#292929] p-1.5 text-[#A8A8A8]"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => act(s.id, { sort_order: s.sort_order + 1 })}
                      aria-label="Move down"
                      className="rounded-md border border-[#292929] p-1.5 text-[#A8A8A8]"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => remove(s.id)} aria-label="Delete" className="rounded-md border border-[#292929] p-1.5 text-[#EF4444]">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className={field}>
                    <input className={inputClass} value={String(val('headline') ?? '')} onChange={(e) => draft(s.id, 'headline', e.target.value)} placeholder="Headline" />
                  </div>
                  <div className={field}>
                    <input className={inputClass} value={String(val('eyebrow'))} onChange={(e) => draft(s.id, 'eyebrow', e.target.value)} placeholder="Eyebrow" />
                  </div>
                  <div className={`${field} sm:col-span-2`}>
                    <input className={inputClass} value={String(val('subheadline'))} onChange={(e) => draft(s.id, 'subheadline', e.target.value)} placeholder="Subheadline" />
                  </div>
                  <div className={field}>
                    <input className={inputClass} value={String(val('cta_text'))} onChange={(e) => draft(s.id, 'cta_text', e.target.value)} placeholder="CTA text" />
                  </div>
                  <div className={field}>
                    <input className={inputClass} value={String(val('cta_url'))} onChange={(e) => draft(s.id, 'cta_url', e.target.value)} placeholder="CTA URL" />
                  </div>
                  <div className={`${field} sm:col-span-2`}>
                    <input className={inputClass} value={String(val('desktop_image'))} onChange={(e) => draft(s.id, 'desktop_image', e.target.value)} placeholder="Desktop image URL" />
                  </div>
                </div>

                {changed && (
                  <button
                    onClick={() => act(s.id, d)}
                    disabled={busy === s.id}
                    className="mt-3 rounded-md bg-[#B3001B] px-3 py-1.5 text-[11px] font-semibold text-[#EFECE6] disabled:opacity-50"
                  >
                    {busy === s.id ? 'Saving…' : 'Save changes'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
    </div>
  );
}