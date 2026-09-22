import Link from 'next/link';
import { Plus, Pencil } from 'lucide-react';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { formatDate } from '@/lib/admin-ui';

export const metadata = { title: 'Products — HEADERR Admin' };

export default async function AdminProductsPage() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, count, error } = await sb
    .from('products')
    .select('id, name, price, compare_price, image, published, featured, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  const products = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#EFECE6]">Products</h1>
          <p className="mt-0.5 text-[12px] text-[#A8A8A8]">{count ?? 0} products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 rounded-md bg-[#B3001B] px-3 py-2 text-[12px] font-semibold text-[#EFECE6] transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-md border border-[#292929] bg-[#111111] p-10 text-center">
          <p className="text-[13px] text-[#666666]">No products in the store yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-[#292929] bg-[#111111]">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#292929] text-[10px] uppercase tracking-widest text-[#666666]">
                <th className="px-4 py-2.5 font-medium">Product</th>
                <th className="px-4 py-2.5 font-medium">Price</th>
                <th className="px-4 py-2.5 font-medium">Compare</th>
                <th className="px-4 py-2.5 font-medium">Added</th>
                <th className="px-4 py-2.5 font-medium">Flags</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292929]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[#171717]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image && (
                        <img src={p.image} alt={p.name} className="h-10 w-10 rounded object-cover" />
                      )}
                      <p className="font-medium text-[#EFECE6]">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#EFECE6]">₹{Number(p.price ?? 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-[#666666]">
                    {p.compare_price ? `₹${Number(p.compare_price).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-[#A8A8A8]">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {p.published && <span className="rounded-full bg-[#4ADE80]/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#4ADE80]">Live</span>}
                      {p.featured && <span className="rounded-full bg-[#60A5FA]/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#60A5FA]">Featured</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="inline-flex items-center gap-1 rounded-md border border-[#292929] px-2 py-1 text-[11px] text-[#A8A8A8] hover:border-[#B3001B] hover:text-[#EFECE6]"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}