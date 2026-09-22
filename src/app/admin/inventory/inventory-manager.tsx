'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { VariantRow } from './page';

function pill(stock: number, threshold: number) {
  if (stock <= 0) return 'bg-[#EF4444]/15 text-[#EF4444]';
  if (stock <= threshold) return 'bg-[#FBBF24]/15 text-[#FBBF24]';
  return 'bg-[#4ADE80]/15 text-[#4ADE80]';
}

export function InventoryManager({ variants }: { variants: VariantRow[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, number>>(() =>
    Object.fromEntries(variants.map((v) => [v.id, v.stock]))
  );
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  async function save(id: string) {
    const stock = Math.max(0, Math.floor(draft[id] ?? 0));
    setSavingId(id);
    const res = await fetch('/api/admin/inventory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stock }),
    });
    setSavingId(null);
    if (!res.ok) {
      setError('Could not save stock.');
      return;
    }
    setError('');
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-md border border-[#292929] bg-[#111111]">
      <table className="w-full text-left text-[12px]">
        <thead>
          <tr className="border-b border-[#292929] text-[10px] uppercase tracking-widest text-[#666666]">
            <th className="px-4 py-2.5 font-medium">Product</th>
            <th className="px-4 py-2.5 font-medium">Size</th>
            <th className="px-4 py-2.5 font-medium">SKU</th>
            <th className="px-4 py-2.5 font-medium">Stock</th>
            <th className="px-4 py-2.5 font-medium">Low at</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 text-right font-medium">Save</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#292929]">
          {variants.map((v) => (
            <tr key={v.id} className="hover:bg-[#171717]">
              <td className="px-4 py-3">
                <p className="font-medium text-[#EFECE6]">{v.product_name}</p>
                <p className="text-[11px] text-[#666666]">{v.product_slug}{!v.published && ' · hidden'}</p>
              </td>
              <td className="px-4 py-3 text-[#A8A8A8]">{v.size}</td>
              <td className="px-4 py-3 font-mono text-[11px] text-[#A8A8A8]">{v.sku ?? '—'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDraft((d) => ({ ...d, [v.id]: Math.max(0, (d[v.id] ?? 0) - 1) }))}
                    aria-label="Decrease stock"
                    className="rounded-md border border-[#292929] p-1 text-[#A8A8A8] hover:border-[#3a3a3a]"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={draft[v.id] ?? 0}
                    onChange={(e) => setDraft((d) => ({ ...d, [v.id]: Number(e.target.value) }))}
                    className="w-16 rounded-md border border-[#292929] bg-[#0D0D0D] px-2 py-1 text-center text-[12px] text-[#EFECE6] focus:border-[#B3001B] focus:outline-none"
                  />
                  <button
                    onClick={() => setDraft((d) => ({ ...d, [v.id]: (d[v.id] ?? 0) + 1 }))}
                    aria-label="Increase stock"
                    className="rounded-md border border-[#292929] p-1 text-[#A8A8A8] hover:border-[#3a3a3a]"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 text-[#A8A8A8]">{v.low_stock_threshold}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${pill(v.stock, v.low_stock_threshold)}`}>
                  {v.stock <= 0 ? 'Out' : v.stock <= v.low_stock_threshold ? 'Low' : 'In stock'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => save(v.id)}
                  disabled={draft[v.id] === v.stock || savingId === v.id}
                  className="rounded-md bg-[#B3001B] px-3 py-1.5 text-[11px] font-semibold text-[#EFECE6] disabled:opacity-40"
                >
                  {savingId === v.id ? 'Saving…' : 'Save'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <p className="border-t border-[#292929] px-4 py-2 text-[12px] text-[#EF4444]">{error}</p>}
    </div>
  );
}