import { adminDataClient } from '@/lib/admin';
import { CrudManager, type CrudField } from '@/components/admin/crud-manager';

export const metadata = { title: 'Navigation — HEADERR Admin' };

const SECTIONS = ['main', 'mobile', 'footer-shop', 'footer-support', 'footer-follow', 'footer-about'];

export default async function AdminNavigationPage() {
  const sb = await adminDataClient();
  const [{ data, error }, { data: products }, { data: pages }] = await Promise.all([
    sb
      .from('navigation_items')
      .select('*')
      .order('section', { ascending: true })
      .order('sort_order', { ascending: true }),
    sb.from('products').select('slug, name').eq('published', true).order('name').limit(200),
    sb.from('site_pages').select('slug, title').eq('published', true).order('title').limit(200),
  ]);
  const items = data ?? [];
  const productOptions = (products ?? []).map((p) => ({
    value: `/shop/products/${p.slug}`,
    label: String(p.name ?? p.slug),
  }));
  const pageOptions = (pages ?? []).map((p) => ({
    value: `/${p.slug}`,
    label: String(p.title ?? p.slug),
  }));

  const fields: CrudField[] = [
    { key: 'section', label: 'Section', type: 'select', options: SECTIONS },
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'href', label: 'Destination', type: 'destination', products: productOptions, pages: pageOptions },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Navigation</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">{items.length} links — pick a destination visually instead of typing URLs.</p>
      </div>
      <CrudManager items={items} fields={fields} apiPath="/api/admin/navigation" requiredField="label" addLabel="Add link" />
      {error && <p className="text-[12px] text-[#EF4444]">Could not load navigation.</p>}
    </div>
  );
}