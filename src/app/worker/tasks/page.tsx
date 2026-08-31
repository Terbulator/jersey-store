'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getTaskStatusColor, getTaskPriorityColor } from '@/components/worker/task-badges';

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate?: string | null;
  order?: { id: string; orderNumber: string } | null;
  description?: string | null;
  createdAt: string;
}

export default function WorkerTasks() {
  const [rows, setRows] = useState<Task[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = status ? `?status=${status}` : '';
    const res = await fetch(`/api/worker/tasks${params}`);
    setRows((await res.json()).tasks ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">My tasks</h1>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
          <option value="">All statuses</option>
          {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="h-32 w-full skeleton rounded-xl" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks found.</p>
      ) : (
        <div className="grid gap-3">
          {rows.map((t) => (
            <Link key={t.id} href={`/worker/tasks/${t.id}`}>
              <div className="rounded-xl border p-4 transition-shadow hover:shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.order ? `Order ${t.order.orderNumber}` : 'No order linked'}
                      {t.dueDate ? ` · Due ${new Date(t.dueDate).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn('border-0', getTaskPriorityColor(t.priority))}>{t.priority}</Badge>
                    <Badge className={cn('border-0', getTaskStatusColor(t.status))}>{t.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
