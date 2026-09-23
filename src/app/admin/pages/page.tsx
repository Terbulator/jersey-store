import Link from 'next/link';
import { requireAdmin, adminDataClient } from '@/lib/admin';

export const metadata = { title: 'Pages — HEADERR Admin' };

export default async function AdminPagesPage() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data } = await sb
    .from('site_pages')
    .select('id, slug, title, published, updated_at')
    .order('sort_order', { ascending: true });

  const items = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#EFECE6]">Pages</h1>
          <p className="mt-0.5 text-[12px] text-[#A8A8A8]">{items.length} pages — Shipping, Returns, FAQ, and any content page, live at /your-slug.</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="rounded-md bg-[#B3001B] px-3 py-1.5 text-[12px] font-semibold text-[#EFECE6] hover:bg-[#d40022]"
        >
          New page
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-[#292929] bg-[#111111]">
        {items.length === 0 && (
          <p className="p-8 text-center text-[13px] text-[#666666]">No pages yet.</p>
        )}
        <ul className="divide-y divide-[#292929]">
          {items.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] text-[#EFECE6]">{p.title}</p>
                <p className="truncate text-[11px] text-[#666666]">/{p.slug}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${p.published ? 'bg-[#4ADE80]/15 text-[#4ADE80]' : 'bg-[#292929] text-[#666666]'}`}>
                {p.published ? 'Live' : 'Hidden'}
              </span>
              <a
                href={`/${p.slug}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-[#292929] px-2.5 py-1.5 text-[11px] text-[#A8A8A8] hover:text-[#EFECE6]"
              >
                View
              </a>
              <Link
                href={`/admin/pages/${p.id}`}
                className="rounded-md border border-[#292929] px-2.5 py-1.5 text-[11px] text-[#A8A8A8] hover:text-[#EFECE6]"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
