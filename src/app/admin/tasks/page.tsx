'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, CircleDot, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  worker: { id: string; name: string } | null;
  order: { id: string; orderNumber: string } | null;
  createdAt: string;
}

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-200 text-gray-800',
};

const priorityColor: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

export default function AdminTasks() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [workers, setWorkers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    workerId: '',
    priority: 'MEDIUM',
  });

  const load = useCallback(async () => {
    const params = filter ? `?status=${filter}` : '';
    const [taskRes, workerRes] = await Promise.all([
      fetch(`/api/admin/tasks${params}`),
      fetch('/api/admin/workers'),
    ]);
    const t = await taskRes.json();
    const w = await workerRes.json();
    setTasks(t.tasks ?? []);
    setWorkers(Array.isArray(w.workers) ? w.workers.map((x: any) => ({ id: x.id, name: x.name })) : []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSubmitting(true);
    const res = await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        workerId: form.workerId || null,
        priority: form.priority,
      }),
    });
    if (res.ok) {
      toast.success('Task created');
      setForm({ title: '', description: '', workerId: '', priority: 'MEDIUM' });
      setShowForm(false);
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to create task');
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex gap-2">
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> New task
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={createTask} className="space-y-4">
              <div>
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Pack and ship order #ABC123"
                />
              </div>
              <div>
                <Label htmlFor="task-desc">Description</Label>
                <Textarea
                  id="task-desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional details…"
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="task-worker">Assign to worker</Label>
                  <Select
                    id="task-worker"
                    value={form.workerId}
                    onChange={(e) => setForm({ ...form, workerId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select
                    id="task-priority"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating…' : 'Create task'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="h-40 w-full skeleton rounded-xl" />
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border py-12 text-center text-muted-foreground">
          <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No tasks found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-start justify-between gap-2 text-base">
                  <span className="line-clamp-2">{t.title}</span>
                  <Badge className={cn('border-0 shrink-0', priorityColor[t.priority] ?? '')}>
                    {t.priority}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {t.description && <p className="text-muted-foreground line-clamp-2">{t.description}</p>}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  {t.status === 'COMPLETED' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : t.status === 'IN_PROGRESS' ? (
                    <Clock className="h-4 w-4 text-blue-600" />
                  ) : (
                    <CircleDot className="h-4 w-4 text-yellow-600" />
                  )}
                  <Badge className={cn('border-0', statusColor[t.status] ?? '')}>{t.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                  {t.worker && <span>Assignee: <strong>{t.worker.name}</strong></span>}
                  {t.order && <span>Order: <strong>{t.order.orderNumber}</strong></span>}
                </div>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
