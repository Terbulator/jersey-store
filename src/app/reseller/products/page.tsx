'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

interface ProductRow {
  id: string;
  name: string;
  basePrice: number;
  resePrice: number;
  category: string;
  team: string;
  image: string;
}

export default function ResellerProducts() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [meta, setMeta] = useState({ priceFloor: 0, priceCeiling: null as number | null, commissionRate: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (q = '') => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    const res = await fetch(`/api/reseller/products?${params}`);
    const d = await res.json();
    setRows(d.products ?? []);
    setMeta({ priceFloor: d.priceFloor ?? 0, priceCeiling: d.priceCeiling ?? null, commissionRate: d.commissionRate ?? 0 });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Products to promote</h1>
        <p className="text-sm text-muted-foreground">
          Catalog you can share. Your resale price = base + {Math.round(meta.commissionRate * 100)}% commission,
          clamped to {formatPrice(meta.priceFloor)}
          {meta.priceCeiling ? `–${formatPrice(meta.priceCeiling)}` : '+'}.
        </p>
      </div>

      <form className="relative sm:max-w-xs" onSubmit={(e) => { e.preventDefault(); load(search); }}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="pl-9" />
      </form>

      {loading ? (
        <div className="h-40 w-full skeleton rounded-xl" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No published products yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="mt-3 space-y-1">
                  <p className="font-medium leading-tight">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}{p.team ? ` · ${p.team}` : ''}</p>
                  <div className="flex items-center justify-between">
                    <Badge className="border-0 bg-primary/10 text-primary">{formatPrice(p.resePrice)}</Badge>
                    <span className="text-xs text-muted-foreground line-through">{formatPrice(p.basePrice)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
