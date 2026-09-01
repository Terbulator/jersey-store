'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Boxes, Minus, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Variant {
  id: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
}

interface ProductRow {
  id: string;
  name: string;
  team: string | null;
  variants: Variant[];
}

export default function WorkerStock() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/worker/stock');
    const d = await res.json();
    setProducts(d.products ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStock = async (variantId: string, stock: number, prodId: string) => {
    const clean = Math.max(0, Math.floor(stock));
    setProducts((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, variants: p.variants.map((v) => (v.id === variantId ? { ...v, stock: clean } : v)) } : p))
    );
    const res = await fetch('/api/worker/stock', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId, stock: clean }),
    });
    if (!res.ok) {
      toast.error('Failed to update stock');
      load();
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.team?.toLowerCase().includes(q) || p.variants.some((v) => v.sku.toLowerCase().includes(q))
    );
  }, [products, query]);

  if (loading) return <div className="h-40 w-full skeleton rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Stock Control</h1>
        <div className="w-full sm:w-72"><Input placeholder="Search by name, team or sku…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border py-12 text-center text-muted-foreground">
          <Boxes className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No products in inventory.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{p.name}{p.team ? <span className="ml-2 text-sm font-normal text-muted-foreground">({p.team})</span> : null}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {p.variants.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                    <div>
                      <div className="font-medium">{v.size} / {v.color}</div>
                      <div className="text-xs text-muted-foreground">{v.sku}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setStock(v.id, v.stock - 1, p.id)}><Minus className="h-3 w-3" /></Button>
                      <Input
                        type="number"
                        min={0}
                        className="h-7 w-16 text-center"
                        value={v.stock}
                        onChange={(e) => setStock(v.id, Number(e.target.value), p.id)}
                      />
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setStock(v.id, v.stock + 1, p.id)}><Plus className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
