'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProductForm, type ProductFormState, type ProductOption } from '../product-form';
import type { Variant } from '../variants-manager';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initial, setInitial] = useState<ProductFormState | null>(null);
  const [categories, setCategories] = useState<ProductOption[]>([]);
  const [editions, setEditions] = useState<ProductOption[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not load product.');
        const p = data.product;
        setInitial({
          slug: p.slug ?? '', name: p.name ?? '', category: p.category ?? '', edition: p.edition ?? '',
          team: p.team ?? '', season: p.season ?? '', badge: p.badge ?? '',
          price: String(p.price ?? ''), compare_price: p.compare_price ? String(p.compare_price) : '',
          image: p.image ?? '', image_alt: p.image_alt ?? '',
          images: Array.isArray(p.images) ? p.images.filter((x: unknown): x is string => typeof x === 'string') : [],
          sizes: Array.isArray(p.sizes) ? p.sizes.filter((x: unknown): x is string => typeof x === 'string') : [],
          description: p.description ?? '', fit: p.fit ?? '', material: p.material ?? '', care: p.care ?? '',
          shipping_note: p.shipping_note ?? '', returns_note: p.returns_note ?? '',
          seo_title: p.seo_title ?? '', seo_description: p.seo_description ?? '', og_image: p.og_image ?? '',
          featured: !!p.featured, published: p.published !== false,
        });
        setCategories(data.categories ?? []);
        setEditions(data.editions ?? []);
        setVariants(data.variants ?? []);
        setLoading(false);
      })
      .catch(() => setError('Could not load product.'));
  }, [params.id]);

  if (loading) return <p className="text-[13px] text-[#666666]">Loading…</p>;
  if (error || !initial) return <p className="text-[13px] text-[#EF4444]">{error || 'Could not load product.'}</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="rounded-md border border-[#292929] p-2 text-[#A8A8A8] hover:border-[#3a3a3a]">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl text-[#EFECE6]">Edit Product</h1>
          <p className="text-[12px] text-[#A8A8A8]">{initial.name || initial.slug}</p>
        </div>
        {!!initial.slug && (
          <a
            href={`/shop/products/${initial.slug}`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-md border border-[#292929] px-3 py-1.5 text-[12px] text-[#A8A8A8] hover:text-[#EFECE6]"
          >
            View
          </a>
        )}
      </div>

      <ProductForm
        initial={initial}
        categories={categories}
        editions={editions}
        productId={params.id}
        variants={variants}
        onSaved={() => {
          router.push('/admin/products');
          router.refresh();
        }}
      />
    </div>
  );
}
