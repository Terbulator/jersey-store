'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ImageUploader } from '@/components/admin/image-uploader';

const inputClass =
  'w-full rounded-md border border-[#292929] bg-[#0D0D0D] px-3 py-2 text-[13px] text-[#EFECE6] placeholder:text-[#666666] focus:border-[#B3001B] focus:outline-none';

const field = 'space-y-1.5';

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-medium uppercase tracking-widest text-[#A8A8A8]">{children}</label>;
}

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: '',
    name: '',
    category: '',
    edition: '',
    team: '',
    season: '',
    badge: '',
    price: '',
    compare_price: '',
    image: '',
    image_alt: '',
    description: '',
    fit: '',
    material: '',
    care: '',
    featured: false,
    published: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string | boolean) => setForm((prev) => ({ ...prev, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: Number(form.price) || 0, compare_price: form.compare_price ? Number(form.compare_price) : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create product.');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="rounded-md border border-[#292929] p-2 text-[#A8A8A8] hover:border-[#3a3a3a]">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-display text-2xl text-[#EFECE6]">Add Product</h1>
          <p className="text-[12px] text-[#A8A8A8]">Create a new product in the catalog.</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-md border border-[#292929] bg-[#111111] p-5">
        <div className={field}>
          <Label>Name *</Label>
          <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="e.g. Argentina 2022 Home Jersey" />
        </div>
        <div className={field}>
          <Label>Slug *</Label>
          <input className={inputClass} value={form.slug} onChange={(e) => set('slug', e.target.value)} required placeholder="argentina-2022-home-jersey" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className={field}>
            <Label>Category *</Label>
            <input className={inputClass} value={form.category} onChange={(e) => set('category', e.target.value)} required placeholder="World Cup" />
          </div>
          <div className={field}>
            <Label>Edition *</Label>
            <input className={inputClass} value={form.edition} onChange={(e) => set('edition', e.target.value)} required placeholder="Fan Version" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className={field}>
            <Label>Team</Label>
            <input className={inputClass} value={form.team} onChange={(e) => set('team', e.target.value)} placeholder="Argentina" />
          </div>
          <div className={field}>
            <Label>Season</Label>
            <input className={inputClass} value={form.season} onChange={(e) => set('season', e.target.value)} placeholder="2022–23" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className={field}>
            <Label>Price (₹) *</Label>
            <input className={inputClass} type="number" value={form.price} onChange={(e) => set('price', e.target.value)} required placeholder="2499" />
          </div>
          <div className={field}>
            <Label>Compare price</Label>
            <input className={inputClass} type="number" value={form.compare_price} onChange={(e) => set('compare_price', e.target.value)} placeholder="2999" />
          </div>
        </div>
        <div className={field}>
          <Label>Product Image</Label>
          <ImageUploader value={form.image} onChange={(url) => set('image', url)} onRemove={() => set('image', '')} />
        </div>
        <div className={field}>
          <Label>Badge</Label>
          <input className={inputClass} value={form.badge} onChange={(e) => set('badge', e.target.value)} placeholder="NEW" />
        </div>
        <div className={field}>
          <Label>Description</Label>
          <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className={field}>
          <Label>Fit</Label>
          <input className={inputClass} value={form.fit} onChange={(e) => set('fit', e.target.value)} placeholder="Regular fit" />
        </div>
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
        {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-md bg-[#B3001B] px-4 py-2.5 text-[12px] font-semibold text-[#EFECE6] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Creating…' : 'Create product'}
        </button>
      </form>
    </div>
  );
}