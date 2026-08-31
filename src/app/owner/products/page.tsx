'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductRow {
  id: string;
  name: string;
  basePrice: number;
  published: boolean;
  featured: boolean;
  category: string;
  image?: string;
  variantCount: number;
}

interface Category {
  id: string;
  name: string;
}

const emptyForm = {
  name: '', categoryId: '', basePrice: '', comparePrice: '', description: '',
  team: '', season: '', player: '', brand: '', published: false, featured: false,
};

export default function OwnerProducts() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [size] = useState(20);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (query) params.set('search', query);
    const res = await fetch(`/api/owner/products?${params}`);
    const data = await res.json();
    setRows(data.products ?? []);
    setCategories(data.categories ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, size, query]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (p: ProductRow) => {
    setEditingId(p.id);
    setForm({ ...emptyForm, name: p.name, basePrice: String(p.basePrice), published: p.published, featured: p.featured });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.basePrice) {
      toast.error('Name and price are required');
      return;
    }
    const url = editingId ? `/api/owner/products/${editingId}` : '/api/owner/products';
    const method = editingId ? 'PATCH' : 'POST';
    const body: Record<string, unknown> = {
      name: form.name,
      description: form.description,
      basePrice: Number(form.basePrice),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
      team: form.team || null,
      season: form.season || null,
      player: form.player || null,
      brand: form.brand || null,
      published: form.published,
      featured: form.featured,
    };
    if (!editingId) body.categoryId = form.categoryId;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success(editingId ? 'Product updated' : 'Product created');
      setDialogOpen(false);
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/owner/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Product deleted');
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to delete');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <form
            className="relative flex-1 sm:max-w-xs"
            onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search); }}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="pl-9"
            />
          </form>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add product
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-40 w-full skeleton rounded-xl" />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <Image
                            src={p.image}
                            alt={p.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{p.name}</p>
                          <div className="flex gap-1">
                            {p.featured && <Badge className="h-5 border-0 bg-primary/10 text-primary">Featured</Badge>}
                            {p.variantCount > 0 && (
                              <span className="text-xs text-muted-foreground">{p.variantCount} sizes</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(p.basePrice)}</td>
                    <td className="px-4 py-3">
                      <Badge className={`border-0 ${p.published ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                        {p.published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(p.id, p.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} · {total} products
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit product' : 'Add product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="p-name">Name *</Label>
              <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Base price *</Label>
                <Input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Compare price</Label>
                <Input type="number" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} />
              </div>
            </div>
            {!editingId && (
              <div className="grid gap-2">
                <Label>Category *</Label>
                <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">Select…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                Published
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Featured
              </label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>{editingId ? 'Save changes' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
