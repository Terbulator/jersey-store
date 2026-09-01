'use client';

import { useCallback, useEffect, useState } from 'react';
import { LifeBuoy, Send, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  orderNumber: string | null;
  customer: string;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
}

const statusColor: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

type Tab = 'mine' | 'unassigned';

export default function WorkerTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [unassigned, setUnassigned] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('mine');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/worker/tickets');
    const d = await res.json();
    setTickets(d.tickets ?? []);
    setUnassigned(d.unassigned ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch(`/api/worker/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error('Failed to update ticket');
      return false;
    }
    return true;
  };

  const claim = async (id: string) => {
    setClaiming(id);
    const res = await fetch('/api/worker/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: id }),
    });
    setClaiming(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to claim ticket');
      return;
    }
    toast.success('Ticket assigned to you');
    await load();
    setTab('mine');
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    const ok = await patch(selected.id, { message: reply.trim() });
    if (ok) {
      setReply('');
      toast.success('Reply sent');
      load();
    }
    setSending(false);
  };

  const setStatus = async (status: string) => {
    if (!selected) return;
    const ok = await patch(selected.id, { status });
    if (ok) {
      setSelected({ ...selected, status });
      load();
    }
  };

  if (loading) return <div className="h-40 w-full skeleton rounded-xl" />;

  const visible = tab === 'mine' ? tickets : unassigned;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <div className="inline-flex rounded-lg border p-1 text-sm">
          <button
            type="button"
            onClick={() => { setTab('mine'); setSelected(null); }}
            className={cn(
              'rounded-md px-3 py-1 transition-colors',
              tab === 'mine' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            Mine ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => { setTab('unassigned'); setSelected(null); }}
            className={cn(
              'rounded-md px-3 py-1 transition-colors',
              tab === 'unassigned' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            Unassigned ({unassigned.length})
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border py-12 text-center text-muted-foreground">
          <LifeBuoy className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>{tab === 'mine' ? 'No tickets assigned to you.' : 'No open tickets waiting for assignment.'}</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          {/* List */}
          <div className="space-y-2">
            {visible.map((t) => (
              <div
                key={t.id}
                className={cn(
                  'w-full rounded-xl border p-4 text-left transition-colors',
                  selected?.id === t.id && 'border-primary bg-accent/50',
                  tab === 'unassigned' ? 'cursor-default' : 'cursor-pointer hover:bg-accent'
                )}
                onClick={() => { if (tab === 'mine') setSelected(t); }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium truncate">{t.subject}</p>
                  <Badge className={cn('border-0 shrink-0', statusColor[t.status] ?? '')}>{t.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t.customer} · {t.repliesCount} replies · {t.orderNumber ? `#${t.orderNumber}` : 'no order'}
                </p>
                {tab === 'unassigned' && (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => { e.stopPropagation(); claim(t.id); }}
                      disabled={claiming === t.id}
                    >
                      <Hand className="h-4 w-4 mr-1" />
                      {claiming === t.id ? 'Claiming…' : 'Assign to me'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Detail */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{selected ? selected.subject : 'Select a ticket'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selected ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={selected.status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="rounded-md border bg-background px-2 py-1 text-sm"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                    <Badge className="border-0 bg-muted text-muted-foreground">{selected.priority}</Badge>
                  </div>
                  <p className="rounded-lg bg-muted p-3 text-sm">{selected.message}</p>
                  <div className="flex gap-2">
                    <Textarea placeholder="Reply to customer…" value={reply} onChange={(e) => setReply(e.target.value)} rows={3} />
                    <Button onClick={sendReply} disabled={sending || !reply.trim()}>
                      <Send className="h-4 w-4 mr-1" /> Send
                    </Button>
                  </div>
                </>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {tab === 'mine'
                    ? 'Choose a ticket from the list to view and respond.'
                    : 'Click "Assign to me" on a ticket to start working on it.'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
