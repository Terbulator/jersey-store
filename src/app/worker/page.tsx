'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ListChecks, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getTaskStatusColor } from '@/components/worker/task-badges';

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate?: string | null;
  order?: { id: string; orderNumber: string } | null;
}

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/worker/tasks');
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || 'Failed to load tasks');
      return;
    }
    setTasks((await res.json()).tasks ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="text-destructive">{error}</p>;

  const counts = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});
  const pending = tasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map((s) => (
          <Card key={s}>
            <CardContent className="p-4">
              <p className="text-3xl font-bold">{counts[s] ?? 0}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.replace('_', ' ')}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Assigned tasks</h2>
          <Link href="/worker/tasks" className="flex items-center gap-1 text-sm text-primary">
            All tasks <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending tasks. You&apos;re all caught up.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pending.map((t) => (
              <Link key={t.id} href={`/worker/tasks/${t.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{t.title}</p>
                      <Badge className={cn('border-0 shrink-0', getTaskStatusColor(t.status))}>{t.status.replace('_', ' ')}</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <ListChecks className="h-3.5 w-3.5" />
                      {t.order ? `Order ${t.order.orderNumber}` : 'No order linked'}
                      {t.dueDate ? ` · Due ${new Date(t.dueDate).toLocaleDateString()}` : ''}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
