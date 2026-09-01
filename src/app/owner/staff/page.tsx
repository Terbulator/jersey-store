'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface StaffRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

const emptyForm = { name: '', email: '', password: '' };

export default function OwnerStaff() {
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/owner/staff');
    setRows((await res.json()).staff ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email and password are required');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    const res = await fetch('/api/owner/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success('Admin created');
      setDialogOpen(false);
      setForm({ ...emptyForm });
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to create admin');
    }
  };

  const filtered = rows.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return s.email.toLowerCase().includes(q) || (s.name ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff</h1>
          <p className="text-sm text-muted-foreground">Manage Administrator accounts. Administrators run daily operations.</p>
        </div>
        <div className="flex gap-2">
          <form className="relative flex-1 sm:max-w-xs" onSubmit={(e) => e.preventDefault()}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff…" className="pl-9" />
          </form>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add admin
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-32 w-full skeleton rounded-xl" />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No admins found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{s.name ?? '—'}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">
                    <Badge className="border-0 bg-red-100 text-red-800">{s.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Add administrator</DialogTitle>
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
              <Label>Password *</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleAdd}>Create admin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
