'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface WorkerRow {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  taskCount: number;
}

const emptyForm = { name: '', email: '', phone: '' };

export default function OwnerWorkers() {
  const [rows, setRows] = useState<WorkerRow[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const load = useCallback(async () => {
    setLoading(true);
    const params = query ? `?search=${encodeURIComponent(query)}` : '';
    const res = await fetch(`/api/owner/workers${params}`);
    const data = await res.json();
    setRows(data.workers ?? []);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    const res = await fetch('/api/owner/workers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success('Worker added');
      setDialogOpen(false);
      setForm({ ...emptyForm });
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to add worker');
    }
  };

  const toggleStatus = async (w: WorkerRow) => {
    const next = w.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const res = await fetch(`/api/owner/workers/${w.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      toast.success(next === 'ACTIVE' ? 'Worker activated' : 'Worker deactivated');
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to update');
    }
  };

  const handleDelete = async (w: WorkerRow) => {
    if (!confirm(`Remove ${w.name}? They will lose worker access.`)) return;
    const res = await fetch(`/api/owner/workers/${w.id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Worker removed');
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to remove');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Workers</h1>
        <div className="flex gap-2">
          <form className="relative flex-1 sm:max-w-xs" onSubmit={(e) => { e.preventDefault(); setQuery(search); }}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workers…" className="pl-9" />
          </form>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add worker
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-32 w-full skeleton rounded-xl" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No workers yet. Add your first worker to assign tasks.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Tasks</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{w.name}</td>
                  <td className="px-4 py-3">{w.email}</td>
                  <td className="px-4 py-3">{w.phone ?? '—'}</td>
                  <td className="px-4 py-3">{w.taskCount}</td>
                  <td className="px-4 py-3">
                    <Badge className={`border-0 ${w.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                      {w.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" onClick={() => toggleStatus(w)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(w)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add worker</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleAdd}>Add worker</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
