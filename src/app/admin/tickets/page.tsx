'use client';

import { useCallback, useEffect, useState } from 'react';
import { LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  customer: string;
  worker: { id: string; name: string } | null;
  orderNumber: string | null;
  replyCount: number;
  createdAt: string;
}

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const statusColor: Record<string, string> = {
  OPEN: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-200 text-gray-800',
};

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [workers, setWorkers] = useState<{ id: string; name: string }[]>([]);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');

  const load = useCallback(async () => {
    const params = status ? `?status=${status}` : '';
    const [tRes, wRes] = await Promise.all([
      fetch(`/api/admin/tickets${params}`),
      fetch('/api/admin/workers'),
    ]);
    const t = await tRes.json();
    const w = await wRes.json();
    setTickets(t.tickets ?? []);
    setWorkers(Array.isArray(w.workers) ? w.workers.map((x: any) => ({ id: x.id, name: x.name })) : []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success('Ticket updated');
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="h-40 w-full skeleton rounded-xl" />
      ) : tickets.length === 0 ? (
        <div className="rounded-xl border py-12 text-center text-muted-foreground">
          <LifeBuoy className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No tickets.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {tickets.map((t) => (
              <Card
                key={t.id}
                className={cn('cursor-pointer transition-shadow hover:shadow-md', selected?.id === t.id && 'ring-2 ring-primary')}
              >
                <CardContent className="p-4" onClick={() => setSelected(t)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground">{t.customer} · {new Date(t.createdAt).toLocaleDateString()}</p>
                      {t.orderNumber && <p className="text-xs text-muted-foreground">Order: {t.orderNumber}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={cn('border-0', statusColor[t.status] ?? '')}>{t.status}</Badge>
                      {t.worker && <span className="text-xs text-muted-foreground">{t.worker.name}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detail panel */}
          <Card className="lg:col-span-1">
            <CardContent className="p-4 space-y-4">
              {!selected ? (
                <p className="text-sm text-muted-foreground">Select a ticket to manage it.</p>
              ) : (
                <>
                  <div>
                    <h3 className="font-semibold">{selected.subject}</h3>
                    <p className="mt-1 text-sm">{selected.message}</p>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={selected.worker?.id ?? ''}
                      onChange={(e) => update(selected.id, { workerId: e.target.value || null })}
                      className="flex-1 h-9"
                    >
                      <option value="">Unassigned</option>
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </Select>
                    <Select
                      value={selected.status}
                      onChange={(e) => update(selected.id, { status: e.target.value })}
                      className="flex-1 h-9"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Add reply ({selected.replyCount} existing)</p>
                    <Textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} placeholder="Type a reply…" />
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!reply.trim()}
                      onClick={async () => {
                        await update(selected.id, { message: reply.trim() });
                        setReply('');
                      }}
                    >
                      Send reply
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
