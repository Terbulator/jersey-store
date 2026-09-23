'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProductForm, type ProductOption } from '../product-form';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ProductOption[]>([]);
  const [editions, setEditions] = useState<ProductOption[]>([]);

  useEffect(() => {
    fetch('/api/admin/products')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories ?? []);
        setEditions(data.editions ?? []);
      })
      .catch(() => {});
  }, []);

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

      <ProductForm
        initial={null}
        categories={categories}
        editions={editions}
        onSaved={() => {
          router.push('/admin/products');
          router.refresh();
        }}
      />
    </div>
  );
}
