import { notFound } from 'next/navigation';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { PageEditor } from '../page-editor';

export const metadata = { title: 'Edit page — HEADERR Admin' };

export default async function AdminEditPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const sb = await adminDataClient();
  const [{ data: page }, { data: products }] = await Promise.all([
    sb.from('site_pages').select('*').eq('id', params.id).maybeSingle(),
    sb.from('products').select('slug, name').eq('published', true).order('name').limit(200),
  ]);
  if (!page) notFound();
  const productOptions = (products ?? []).map((p) => ({ value: `/shop/products/${p.slug}`, label: String(p.name ?? p.slug) }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Edit page</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">
          Live at{' '}
          <a href={`/${page.slug}`} target="_blank" rel="noreferrer" className="underline hover:text-[#EFECE6]">
            /{page.slug}
          </a>
        </p>
      </div>
      <PageEditor
        initial={{
          id: page.id,
          title: page.title ?? '',
          slug: page.slug ?? '',
          blocks: Array.isArray(page.blocks) ? page.blocks : [],
          published: !!page.published,
          seo_title: page.seo_title ?? '',
          seo_description: page.seo_description ?? '',
        }}
        products={productOptions}
      />
    </div>
  );
}
