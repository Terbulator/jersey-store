import { requireAdmin, adminDataClient } from '@/lib/admin';
import { PageEditor } from '../page-editor';

export const metadata = { title: 'New page — HEADERR Admin' };

export default async function AdminNewPage() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data: products } = await sb.from('products').select('slug, name').eq('published', true).order('name').limit(200);
  const productOptions = (products ?? []).map((p) => ({ value: `/shop/products/${p.slug}`, label: String(p.name ?? p.slug) }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">New page</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">Content pages render with the static template at /your-slug.</p>
      </div>
      <PageEditor initial={null} products={productOptions} />
    </div>
  );
}
