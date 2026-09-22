'use client';

import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ReviewRow {
  id: string;
  product_name: string | null;
  product_variant: string | null;
  customer_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  verified_buyer: boolean;
  status: string;
  featured: boolean;
  created_at: string;
}

const STATUS_ORDER = ['pending', 'approved', 'rejected'];

function statusPill(status: string) {
  if (status === 'approved') return 'bg-[#4ADE80]/15 text-[#4ADE80]';
  if (status === 'rejected') return 'bg-[#EF4444]/15 text-[#EF4444]';
  return 'bg-[#FBBF24]/15 text-[#FBBF24]';
}

export function ReviewsManager({ items }: { items: ReviewRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = filter === 'all' ? items : items.filter((r) => r.status === filter);

  async function act(id: string, body: Record<string, unknown>) {
    setBusy(id);
    const res = await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...body }),
    });
    setBusy(null);
    if (!res.ok) {
      setError('Could not update review.');
      return;
    }
    setError('');
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch('/api/admin/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) setError('Could not delete review.');
    else router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['all', ...STATUS_ORDER].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${
              filter === s ? 'bg-[#B3001B] text-[#EFECE6]' : 'border border-[#292929] text-[#A8A8A8] hover:border-[#3a3a3a]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-[#292929] bg-[#111111] p-10 text-center">
          <p className="text-[13px] text-[#666666]">No reviews here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-md border border-[#292929] bg-[#111111] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#EFECE6]">{r.customer_name}</span>
                    <span className="text-[11px] text-[#666666]">on {r.product_name ?? 'unknown product'}{r.product_variant ? ` · ${r.product_variant}` : ''}</span>
                    {r.verified_buyer && (
                      <span className="rounded-full bg-[#60A5FA]/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#60A5FA]">Verified</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`h-3 w-3 ${n <= r.rating ? 'fill-[#FBBF24] text-[#FBBF24]' : 'text-[#666666]'}`} />
                    ))}
                  </div>
                  {r.title && <p className="mt-2 text-[13px] font-semibold text-[#EFECE6]">{r.title}</p>}
                  {r.body && <p className="mt-1 text-[13px] leading-relaxed text-[#A8A8A8]">{r.body}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusPill(r.status)}`}>{r.status}</span>
                  <button
                    onClick={() => act(r.id, { featured: !r.featured })}
                    disabled={busy === r.id}
                    className={`rounded-md border px-2.5 py-1 text-[11px] ${r.featured ? 'border-[#B3001B] text-[#EFECE6]' : 'border-[#292929] text-[#A8A8A8] hover:border-[#3a3a3a]'} disabled:opacity-50`}
                  >
                    {r.featured ? '★ Featured' : 'Feature'}
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {r.status !== 'approved' && (
                  <button onClick={() => act(r.id, { status: 'approved' })} disabled={busy === r.id} className="rounded-md bg-[#4ADE80]/15 px-3 py-1.5 text-[11px] font-semibold text-[#4ADE80] disabled:opacity-50">
                    Approve
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button onClick={() => act(r.id, { status: 'rejected' })} disabled={busy === r.id} className="rounded-md bg-[#EF4444]/15 px-3 py-1.5 text-[11px] font-semibold text-[#EF4444] disabled:opacity-50">
                    Reject
                  </button>
                )}
                {r.status !== 'pending' && (
                  <button onClick={() => act(r.id, { status: 'pending' })} disabled={busy === r.id} className="rounded-md border border-[#292929] px-3 py-1.5 text-[11px] text-[#A8A8A8] disabled:opacity-50">
                    Unapprove
                  </button>
                )}
                <button onClick={() => remove(r.id)} aria-label="Delete review" className="ml-auto rounded-md border border-[#292929] p-1.5 text-[#EF4444] hover:border-[#3a3a3a]">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
    </div>
  );
}