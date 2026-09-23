'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2, X, Plus } from 'lucide-react';
import { ImageUploader } from '@/components/admin/image-uploader';
import { VariantsManager, type Variant } from './variants-manager';

export interface ProductFormState {
  slug: string;
  name: string;
  category: string;
  edition: string;
  team: string;
  season: string;
  badge: string;
  price: string;
  compare_price: string;
  image: string;
  image_alt: string;
  images: string[];
  sizes: string[];
  description: string;
  fit: string;
  material: string;
  care: string;
  shipping_note: string;
  returns_note: string;
  seo_title: string;
  seo_description: string;
  og_image: string;
  featured: boolean;
  published: boolean;
}

export interface ProductOption {
  slug: string;
  name: string;
}

export const EMPTY_PRODUCT: ProductFormState = {
  slug: '', name: '', category: '', edition: '', team: '', season: '', badge: '',
  price: '', compare_price: '', image: '', image_alt: '', images: [], sizes: [],
  description: '', fit: '', material: '', care: '', shipping_note: '', returns_note: '',
  seo_title: '', seo_description: '', og_image: '', featured: false, published: true,
};

const inputClass =
  'w-full rounded-md border border-[#292929] bg-[#0D0D0D] px-3 py-2 text-[13px] text-[#EFECE6] placeholder:text-[#666666] focus:border-[#B3001B] focus:outline-none';

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-medium uppercase tracking-widest text-[#A8A8A8]">{children}</label>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-md border border-[#292929] bg-[#111111] p-5">
      <h2 className="font-mono-meta text-[10px] text-off-white/50 uppercase tracking-[0.18em]">{title}</h2>
      {children}
    </section>
  );
}

const field = 'space-y-1.5';
const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export function ProductForm({
  initial,
  categories,
  editions,
  productId,
  variants,
  onSaved,
}: {
  initial: ProductFormState | null;
  categories: ProductOption[];
  editions: ProductOption[];
  productId?: string;
  variants?: Variant[];
  onSaved: (id: string) => void;
}) {
  const [form, setForm] = useState<ProductFormState>(initial ?? { ...EMPTY_PRODUCT });
  const [sizeInput, setSizeInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof ProductFormState, v: string | boolean | string[]) =>
    setForm((prev) => ({ ...prev, [k]: v } as ProductFormState));

  function moveImage(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= form.images.length) return;
    const next = [...form.images];
    const [moved] = next.splice(i, 1);
    next.splice(j, 0, moved);
    set('images', next);
  }

  function addSize(raw: string) {
    const s = raw.trim().toUpperCase();
    if (s && !form.sizes.includes(s)) set('sizes', [...form.sizes, s]);
    setSizeInput('');
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        compare_price: form.compare_price ? Number(form.compare_price) : null,
      };
      const isNew = !productId;
      const res = await fetch(isNew ? '/api/admin/products' : `/api/admin/products/${productId}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save product.');
      onSaved(isNew ? data.id : productId!);
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <Section title="Basic">
        <div className={field}>
          <Label>Name *</Label>
          <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div className={field}>
          <Label>Slug *</Label>
          <input className={inputClass} value={form.slug} onChange={(e) => set('slug', e.target.value)} required placeholder="argentina-2022-home-jersey" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className={field}>
            <Label>Category *</Label>
            <select className={inputClass} value={form.category} onChange={(e) => set('category', e.target.value)} required>
              <option value="">Choose…</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
              {form.category && !categories.some((c) => c.slug === form.category) && (
                <option value={form.category}>{form.category}</option>
              )}
            </select>
          </div>
          <div className={field}>
            <Label>Edition *</Label>
            <select className={inputClass} value={form.edition} onChange={(e) => set('edition', e.target.value)} required>
              <option value="">Choose…</option>
              {editions.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
              {form.edition && !editions.some((c) => c.slug === form.edition) && (
                <option value={form.edition}>{form.edition}</option>
              )}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className={field}>
            <Label>Team</Label>
            <input className={inputClass} value={form.team} onChange={(e) => set('team', e.target.value)} />
          </div>
          <div className={field}>
            <Label>Season</Label>
            <input className={inputClass} value={form.season} onChange={(e) => set('season', e.target.value)} />
          </div>
        </div>
        <div className={field}>
          <Label>Badge</Label>
          <select className={inputClass} value={form.badge} onChange={(e) => set('badge', e.target.value)}>
            <option value="">None</option>
            <option value="NEW">NEW</option>
            <option value="SALE">SALE</option>
            <option value="LIMITED">LIMITED</option>
          </select>
        </div>
      </Section>

      <Section title="Pricing">
        <div className="grid grid-cols-2 gap-4">
          <div className={field}>
            <Label>Price (₹) *</Label>
            <input className={inputClass} type="number" min={0} value={form.price} onChange={(e) => set('price', e.target.value)} required />
          </div>
          <div className={field}>
            <Label>Compare price</Label>
            <input className={inputClass} type="number" min={0} value={form.compare_price} onChange={(e) => set('compare_price', e.target.value)} />
          </div>
        </div>
      </Section>

      <Section title="Media">
        <div className={field}>
          <Label>Primary image</Label>
          <ImageUploader value={form.image} onChange={(url) => set('image', url)} onRemove={() => set('image', '')} folder="products" />
        </div>
        <div className={field}>
          <Label>Image alt text</Label>
          <input className={inputClass} value={form.image_alt} onChange={(e) => set('image_alt', e.target.value)} />
        </div>
        <div className={field}>
          <Label>Gallery — drag order with arrows, first extra image shows on card hover</Label>
          {form.images.length === 0 && <p className="text-[12px] text-[#666666]">No gallery images. Upload below.</p>}
          <ul className="space-y-2">
            {form.images.map((url, i) => (
              <li key={`${url}-${i}`} className="flex items-center gap-2 rounded-md border border-[#292929] p-2">
                <img src={url} alt="" className="h-12 w-12 shrink-0 rounded object-cover" />
                <span className="min-w-0 flex-1 truncate text-[11px] text-[#666666]">{url}</span>
                <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="rounded p-1 text-[#666666] hover:text-[#EFECE6] disabled:opacity-30" aria-label="Move up">
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} className="rounded p-1 text-[#666666] hover:text-[#EFECE6] disabled:opacity-30" aria-label="Move down">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => set('image', url)} className="rounded border border-[#292929] px-2 py-1 text-[10px] text-[#A8A8A8] hover:text-[#EFECE6]" title="Use as primary image">
                  Primary
                </button>
                <button type="button" onClick={() => set('images', form.images.filter((_, j) => j !== i))} className="rounded p-1 text-[#EF4444]" aria-label="Remove image">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
          <ImageUploader value="" onChange={(url) => set('images', [...form.images, url])} folder="products" />
        </div>
      </Section>

      <Section title="Sizes">
        <div className="flex flex-wrap gap-1.5">
          {form.sizes.map((s) => (
            <span key={s} className="flex items-center gap-1 rounded-full border border-[#3a3a3a] px-2.5 py-1 text-[12px] text-[#EFECE6]">
              {s}
              <button type="button" onClick={() => set('sizes', form.sizes.filter((x) => x !== s))} className="text-[#666666] hover:text-[#EF4444]" aria-label={`Remove size ${s}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {form.sizes.length === 0 && <span className="text-[12px] text-[#666666]">No sizes — add at least one for Quick Add.</span>}
        </div>
        <div className="flex gap-2">
          <input
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSize(sizeInput); } }}
            placeholder="Add size (e.g. M)"
            className={inputClass}
          />
          <button type="button" onClick={() => addSize(sizeInput)} className="flex shrink-0 items-center gap-1 rounded-md border border-[#292929] px-3 text-[12px] text-[#A8A8A8] hover:text-[#EFECE6]">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
          <button type="button" onClick={() => set('sizes', [...STANDARD_SIZES])} className="shrink-0 rounded-md border border-[#292929] px-3 text-[12px] text-[#A8A8A8] hover:text-[#EFECE6]">
            S–XXL
          </button>
        </div>
      </Section>

      <Section title="Details">
        <div className={field}>
          <Label>Description</Label>
          <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className={field}>
            <Label>Fit</Label>
            <input className={inputClass} value={form.fit} onChange={(e) => set('fit', e.target.value)} />
          </div>
          <div className={field}>
            <Label>Material</Label>
            <input className={inputClass} value={form.material} onChange={(e) => set('material', e.target.value)} />
          </div>
        </div>
        <div className={field}>
          <Label>Care</Label>
          <input className={inputClass} value={form.care} onChange={(e) => set('care', e.target.value)} />
        </div>
        <div className={field}>
          <Label>Shipping note</Label>
          <textarea className={inputClass} rows={2} value={form.shipping_note} onChange={(e) => set('shipping_note', e.target.value)} />
        </div>
        <div className={field}>
          <Label>Returns note</Label>
          <textarea className={inputClass} rows={2} value={form.returns_note} onChange={(e) => set('returns_note', e.target.value)} />
        </div>
      </Section>

      <Section title="SEO">
        <div className={field}>
          <Label>SEO title</Label>
          <input className={inputClass} value={form.seo_title} onChange={(e) => set('seo_title', e.target.value)} placeholder="Defaults to the product name" />
        </div>
        <div className={field}>
          <Label>SEO description</Label>
          <textarea className={inputClass} rows={2} value={form.seo_description} onChange={(e) => set('seo_description', e.target.value)} />
        </div>
        <div className={field}>
          <Label>Social share image</Label>
          <ImageUploader value={form.og_image} onChange={(url) => set('og_image', url)} onRemove={() => set('og_image', '')} folder="products" />
        </div>
      </Section>

      <Section title="Visibility">
        <div className="flex items-center gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#EFECE6]">
            <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} className="accent-[#B3001B]" />
            Published
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#EFECE6]">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="accent-[#B3001B]" />
            Featured
          </label>
        </div>
      </Section>

      {productId && <VariantsManager productId={productId} initial={variants ?? []} />}

      {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
      <button type="submit" disabled={saving} className="w-full rounded-md bg-[#B3001B] px-4 py-2.5 text-[12px] font-semibold text-[#EFECE6] transition-opacity hover:opacity-90 disabled:opacity-50">
        {saving ? 'Saving…' : productId ? 'Save changes' : 'Create product'}
      </button>
    </form>
  );
}
