'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getTaskStatusColor, getTaskPriorityColor } from '@/components/worker/task-badges';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  dueDate?: string | null;
  notes?: string | null;
  order?: { id: string; orderNumber: string } | null;
  createdAt: string;
}

export default function WorkerTaskDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveOpen, setSaveOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/worker/tasks');
    const data = (await res.json()).tasks ?? [];
    const found = data.find((t: Task) => t.id === params.id);
    setTask(found ?? null);
    if (found) {
      setStatus(found.status);
      setNotes(found.notes ?? '');
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    const res = await fetch(`/api/worker/tasks/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    if (res.ok) {
      toast.success('Task updated');
      setSaveOpen(false);
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to update');
    }
  };

  if (loading) return <div className="h-40 w-full skeleton rounded-xl" />;
  if (!task) return <p className="text-sm text-muted-foreground">Task not found.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <button
        onClick={() => router.push('/worker/tasks')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to tasks
      </button>

      <div className="rounded-xl border p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-xl font-bold">{task.title}</h1>
          <div className="flex items-center gap-2">
            <Badge className={cn('border-0', getTaskPriorityColor(task.priority))}>{task.priority}</Badge>
            <Badge className={cn('border-0', getTaskStatusColor(task.status))}>{task.status.replace('_', ' ')}</Badge>
          </div>
        </div>

        {task.order && (
          <p className="mt-1 text-sm text-muted-foreground">Linked order: {task.order.orderNumber}</p>
        )}
        {task.dueDate && (
          <p className="mt-1 text-sm text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
        )}
        {task.description && <p className="mt-4 text-sm">{task.description}</p>}
      </div>

      {task.notes && (
        <div className="rounded-xl border p-5">
          <p className="text-sm font-medium">Notes</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{task.notes}</p>
        </div>
      )}

      <div className="rounded-xl border p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? 'default' : 'outline'}
              onClick={() => setStatus(s)}
            >
              {s.replace('_', ' ')}
            </Button>
          ))}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notes">Add a note</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Progress update, questions, handoff details…" />
        </div>
        <Button className="mt-4" onClick={() => setSaveOpen(true)}>
          <Save className="mr-2 h-4 w-4" /> Save changes
        </Button>
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm update</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Set status to <span className="font-medium text-foreground">{status.replace('_', ' ')}</span>
            {notes ? ' and save your note' : ''}?
          </p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
