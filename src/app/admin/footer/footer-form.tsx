'use client';

import { useState } from 'react';
import { Save, Check, Plus, Trash2 } from 'lucide-react';
import { DestinationInput } from '@/components/admin/destination-field';
import type { FooterSettings } from '@/lib/site-chrome';

import type { FormStatus as Status } from '@/lib/admin-ui';

import { formInputCls as inputCls } from '@/lib/admin-ui';

export function FooterForm({ initial }: { initial: FooterSettings }) {
  const [form, setForm] = useState<FooterSettings>(() => JSON.parse(JSON.stringify(initial)) as FooterSettings);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const set = <K extends keyof FooterSettings>(k: K, v: FooterSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  async function save() {
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ footer: form }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus({ kind: 'error', message: j?.error ?? 'Could not save footer.' });
        return;
      }
      setStatus({ kind: 'saved', message: 'Footer saved — live across the storefront.' });
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
          <Save className="h-3.5 w-3.5" /> {status.kind === 'saving' ? 'Saving…' : 'Save Footer'}
        </button>
        {status.kind === 'saved' && (
          <span className="flex items-center gap-1 text-[12px] text-[#4ADE80]">
            <Check className="h-3.5 w-3.5" /> {status.message}
          </span>
        )}
        {status.kind === 'error' && <span className="text-[12px] text-[#EF4444]">{status.message}</span>}
      </div>

      <section className="space-y-3 rounded-md border border-[#292929] bg-[#111111] p-4">
        <h2 className="font-mono-meta text-[10px] text-off-white/50 uppercase tracking-[0.18em]">Brand</h2>
        <div>
          <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Logo text</label>
          <input value={form.logo_text} onChange={(e) => set('logo_text', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Description</label>
          <textarea value={form.description} rows={3} onChange={(e) => set('description', e.target.value)} className={`${inputCls} rounded-xl`} />
        </div>
        <div>
          <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Copyright line</label>
          <input value={form.copyright} onChange={(e) => set('copyright', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Background</label>
          <input value={form.bg} onChange={(e) => set('bg', e.target.value)} placeholder="Default" className={inputCls} />
        </div>
        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={form.show_wordmark}
            onChange={(e) => set('show_wordmark', e.target.checked)}
            className="h-4 w-4 shrink-0 accent-[#B3001B]"
          />
          <span className="text-[13px] text-[#EFECE6]">Show giant HEADERR wordmark</span>
        </label>
      </section>

      <section className="space-y-3 rounded-md border border-[#292929] bg-[#111111] p-4">
        <h2 className="font-mono-meta text-[10px] text-off-white/50 uppercase tracking-[0.18em]">Legal links</h2>
        {form.legal.map((link, i) => (
          <div key={i} className="space-y-2 rounded-md border border-[#292929] p-3">
            <div className="flex items-center justify-between">
              <p className="font-mono-meta text-[10px] text-off-white/50">Link {i + 1}</p>
              <button
                onClick={() => set('legal', form.legal.filter((_, j) => j !== i))}
                className="text-[#EF4444]"
                aria-label="Remove legal link"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Label</label>
              <input
                value={link.label}
                onChange={(e) => {
                  const next = [...form.legal];
                  next[i] = { ...next[i], label: e.target.value };
                  set('legal', next);
                }}
                className={inputCls}
              />
            </div>
            <DestinationInput
              value={link.href}
              onChange={(href) => {
                const next = [...form.legal];
                next[i] = { ...next[i], href };
                set('legal', next);
              }}
            />
          </div>
        ))}
        {form.legal.length < 8 && (
          <button
            onClick={() => set('legal', [...form.legal, { label: '', href: '/' }])}
            className="flex items-center gap-1 text-[11px] text-off-white/60 hover:text-off-white"
          >
            <Plus className="h-3 w-3" /> Add link
          </button>
        )}
      </section>
    </div>
  );
}
