'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ChevronUp, ChevronDown, Save, Check } from 'lucide-react';
import { ImageUploader } from '@/components/admin/image-uploader';
import { DestinationInput } from '@/components/admin/destination-field';
import { StaticBlocks } from '@/components/website/static-blocks';
import type { PageBlocks } from '@/lib/pages';

export interface PageForm {
  id?: string;
  title: string;
  slug: string;
  blocks: PageBlocks;
  published: boolean;
  seo_title: string;
  seo_description: string;
}

type Status = { kind: 'idle' | 'saving' | 'saved' | 'error'; message?: string };

const inputCls = 'input w-full text-[12px]';
const BLOCK_TYPES = ['heading', 'text', 'image', 'button', 'divider'] as const;

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

export function PageEditor({
  initial,
  products,
}: {
  initial: PageForm | null;
  products: { value: string; label: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<PageForm>(
    initial ?? { title: '', slug: '', blocks: [], published: true, seo_title: '', seo_description: '' }
  );
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = <K extends keyof PageForm>(k: K, v: PageForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  function updateBlock(id: string, patch: Record<string, unknown>) {
    set('blocks', form.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function moveBlock(id: string, dir: -1 | 1) {
    const idx = form.blocks.findIndex((b) => b.id === id);
    const j = idx + dir;
    if (idx === -1 || j < 0 || j >= form.blocks.length) return;
    const next = [...form.blocks];
    const [moved] = next.splice(idx, 1);
    next.splice(j, 0, moved);
    set('blocks', next);
  }

  async function save() {
    setStatus({ kind: 'saving' });
    try {
      const isNew = !form.id;
      const res = await fetch('/api/admin/pages', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isNew
            ? { title: form.title, slug: form.slug, blocks: form.blocks, published: form.published, seo_title: form.seo_title || undefined, seo_description: form.seo_description || undefined }
            : { id: form.id, title: form.title, slug: form.slug, blocks: form.blocks, published: form.published, seo_title: form.seo_title || undefined, seo_description: form.seo_description || undefined }
        ),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus({ kind: 'error', message: j?.error ?? 'Could not save page.' });
        return;
      }
      setStatus({ kind: 'saved', message: 'Page saved.' });
      if (isNew && j?.id) router.replace(`/admin/pages/${j.id}`);
      else router.refresh();
    } catch {
      setStatus({ kind: 'error', message: 'Network error — try again.' });
    }
  }

  async function remove() {
    if (!form.id) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    const res = await fetch('/api/admin/pages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: form.id }),
    });
    if (!res.ok) {
      setStatus({ kind: 'error', message: 'Could not delete page.' });
      return;
    }
    router.replace('/admin/pages');
  }

  return (
    <div className="grid grid-cols-1 gap-5 pb-10 xl:grid-cols-2">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={save}
            disabled={status.kind === 'saving'}
            className="flex items-center gap-1.5 rounded-md bg-[#B3001B] px-3 py-1.5 text-[12px] font-semibold text-[#EFECE6] hover:bg-[#d40022] disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" /> {status.kind === 'saving' ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={() => set('published', !form.published)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase ${form.published ? 'bg-[#4ADE80]/15 text-[#4ADE80]' : 'bg-[#292929] text-[#666666]'}`}
          >
            {form.published ? 'Live' : 'Hidden'}
          </button>
          {form.id && (
            <button
              onClick={remove}
              className={`rounded-md border px-2.5 py-1.5 text-[11px] ${confirmDelete ? 'border-[#EF4444] text-[#EF4444]' : 'border-[#292929] text-[#A8A8A8] hover:text-[#EFECE6]'}`}
            >
              {confirmDelete ? 'Sure?' : 'Delete'}
            </button>
          )}
          {status.kind === 'saved' && (
            <span className="flex items-center gap-1 text-[12px] text-[#4ADE80]">
              <Check className="h-3.5 w-3.5" /> {status.message}
            </span>
          )}
          {status.kind === 'error' && <span className="text-[12px] text-[#EF4444]">{status.message}</span>}
        </div>

        <section className="space-y-3 rounded-md border border-[#292929] bg-[#111111] p-4">
          <div>
            <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Title</label>
            <input
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({ ...f, title, slug: f.slug || slugify(title) }));
              }}
              className={inputCls}
            />
          </div>
          <div>
            <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">URL slug</label>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-[#666666]">/</span>
              <input value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">SEO title</label>
              <input value={form.seo_title} onChange={(e) => set('seo_title', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">SEO description</label>
              <input value={form.seo_description} onChange={(e) => set('seo_description', e.target.value)} className={inputCls} />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-mono-meta text-[10px] text-off-white/50 uppercase tracking-[0.18em]">Content blocks</h2>
          {form.blocks.map((b, i) => (
            <div key={b.id} className="space-y-2 rounded-md border border-[#292929] bg-[#111111] p-3">
              <div className="flex items-center justify-between">
                <p className="font-mono-meta text-[10px] text-off-white/50 capitalize">{b.type}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveBlock(b.id, -1)} disabled={i === 0} className="rounded p-1 text-[#666666] hover:text-[#EFECE6] disabled:opacity-30" aria-label="Move up">
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => moveBlock(b.id, 1)} disabled={i === form.blocks.length - 1} className="rounded p-1 text-[#666666] hover:text-[#EFECE6] disabled:opacity-30" aria-label="Move down">
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => set('blocks', form.blocks.filter((x) => x.id !== b.id))} className="rounded p-1 text-[#EF4444]" aria-label="Remove block">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {(b.type === 'heading' || b.type === 'text' || b.type === 'button') && (
                <div>
                  <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Text</label>
                  {b.type === 'text' ? (
                    <textarea value={b.text ?? ''} rows={3} onChange={(e) => updateBlock(b.id, { text: e.target.value })} className={`${inputCls} rounded-xl`} />
                  ) : (
                    <input value={b.text ?? ''} onChange={(e) => updateBlock(b.id, { text: e.target.value })} className={inputCls} />
                  )}
                </div>
              )}
              {b.type === 'heading' && (
                <div>
                  <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Size</label>
                  <select value={b.size ?? 'md'} onChange={(e) => updateBlock(b.id, { size: e.target.value })} className={inputCls}>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                  </select>
                </div>
              )}
              {b.type === 'image' && (
                <>
                  <ImageUploader value={b.url ?? ''} onChange={(url) => updateBlock(b.id, { url })} folder="pages" />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Alt text</label>
                      <input value={b.alt ?? ''} onChange={(e) => updateBlock(b.id, { alt: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Caption</label>
                      <input value={b.caption ?? ''} onChange={(e) => updateBlock(b.id, { caption: e.target.value })} className={inputCls} />
                    </div>
                  </div>
                </>
              )}
              {b.type === 'button' && (
                <DestinationInput value={b.destination ?? '/shop'} products={products} onChange={(destination) => updateBlock(b.id, { destination })} />
              )}
            </div>
          ))}
          <div className="flex flex-wrap gap-1.5">
            {BLOCK_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => set('blocks', [...form.blocks, { id: crypto.randomUUID(), type: t }])}
                className="flex items-center gap-1 rounded-md border border-dashed border-[#292929] px-2.5 py-1.5 text-[11px] capitalize text-[#A8A8A8] hover:border-[#B3001B] hover:text-[#EFECE6]"
              >
                <Plus className="h-3 w-3" /> {t}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="xl:sticky xl:top-4 xl:self-start">
        <div className="overflow-hidden rounded-md border border-[#292929] bg-[#0a0a0a]">
          <p className="border-b border-[#292929] bg-[#0d0d0d] px-4 py-2 font-mono-meta text-[10px] uppercase tracking-[0.18em] text-[#666666]">
            Preview — same renderer as the storefront
          </p>
          <div className="bg-black p-6">
            <h1 className="th-h1 mb-8 text-off-white">{form.title || 'Untitled page'}</h1>
            <StaticBlocks blocks={form.blocks} />
          </div>
        </div>
      </div>
    </div>
  );
}
