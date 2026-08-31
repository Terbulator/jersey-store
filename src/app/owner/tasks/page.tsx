'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TaskRow {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  worker?: { id: string; name: string } | null;
  order?: { id: string; orderNumber: string } | null;
  createdAt: string;
}

interface WorkerOpt {
  id: string;
  name: string;
}

const priorityColor: Record<string, string> = {
  LOW: 'bg-gray-200 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};
const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-200 text-gray-800',
};

const emptyForm = { title: '', description: '', priority: 'MEDIUM', workerId: '', dueDate: '' };

export default function OwnerTasks() {
  const [rows, setRows] = useState<TaskRow[]>([]);
  const [workers, setWorkers] = useState<WorkerOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/owner/tasks');
    setRows((await res.json()).tasks ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetch('/api/owner/workers')
      .then((r) => r.json())
      .then((d) => setWorkers(d.workers ?? []));
  }, []);

  const handleCreate = async () => {
    if (!form.title) {
      toast.error('Title is required');
      return;
    }
    const res = await fetch('/api/owner/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        priority: form.priority,
        workerId: form.workerId || null,
        dueDate: form.dueDate || null,
      }),
    });
    if (res.ok) {
      toast.success('Task created');
      setDialogOpen(false);
      setForm({ ...emptyForm });
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to create task');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/owner/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success('Task updated');
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New task
        </Button>
      </div>

      {loading ? (
        <div className="h-40 w-full skeleton rounded-xl" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks yet. Create one and assign it to a worker.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((t) => (
            <div key={t.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.worker ? `Assigned to ${t.worker.name}` : 'Unassigned'}
                    {t.order ? ` · Order ${t.order.orderNumber}` : ''}
                    {t.dueDate ? ` · Due ${new Date(t.dueDate).toLocaleDateString()}` : ''}
                  </p>
                  {t.description && <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn('border-0', priorityColor[t.priority] ?? 'bg-gray-200 text-gray-700')}>{t.priority}</Badge>
                  <Badge className={cn('border-0', statusColor[t.status] ?? 'bg-gray-200 text-gray-700')}>{t.status}</Badge>
                  {t.status === 'PENDING' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, 'IN_PROGRESS')}>Start</Button>
                  )}
                  {t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && (
                    <Button size="sm" onClick={() => updateStatus(t.id, 'COMPLETED')}>Complete</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {Object.keys(priorityColor).map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Assign to</Label>
                <Select value={form.workerId} onChange={(e) => setForm({ ...form, workerId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Due date</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleCreate}>Create task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
