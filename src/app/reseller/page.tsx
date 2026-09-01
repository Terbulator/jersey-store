'use client';

import { useCallback, useEffect, useState } from 'react';
import { Copy, Check, Share2, Wallet, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface Sale {
  id: string;
  orderNumber: string;
  commission: number;
  status: string;
  createdAt: string;
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  note: string | null;
  createdAt: string;
}

interface Summary {
  referralCode: string;
  commissionRate: number;
  priceFloor: number;
  priceCeiling: number | null;
  tier: string;
  status: string;
  orders: number;
  earned: number;
  pending: number;
  paid: number;
  referralLink: string;
  sales: Sale[];
  payouts: Payout[];
}

export default function ResellerDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/reseller');
    const d = await res.json();
    setSummary(d.summary ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const copyLink = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${summary.referralLink}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const requestPayout = async () => {
    if (!amount) return;
    setSubmitting(true);
    const res = await fetch('/api/reseller/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount) }),
    });
    const d = await res.json();
    if (res.ok) {
      toast.success('Payout requested');
      setAmount('');
      load();
    } else {
      toast.error(d.error || 'Failed to request payout');
    }
    setSubmitting(false);
  };

  if (!summary) {
    return <div className="h-40 w-full skeleton rounded-xl" />;
  }

  const cards = [
    { label: 'Total earned', value: formatPrice(summary.earned), icon: TrendingUp },
    { label: 'Pending payout', value: formatPrice(summary.pending), icon: Wallet },
    { label: 'Paid', value: formatPrice(summary.paid), icon: CheckCircle2 },
    { label: 'Orders referred', value: String(summary.orders), icon: Share2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Reseller Dashboard</h1>
        <Badge className="border-0 bg-green-100 text-green-800">{summary.tier}</Badge>
      </div>

      {/* Referral link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Share2 className="h-4 w-4" /> Your referral link</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <code className="flex-1 truncate rounded-lg bg-muted px-3 py-2 text-sm">{window.location.origin}{summary.referralLink}</code>
          <Button onClick={copyLink} variant="outline">
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <c.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payout request */}
        <Card>
          <CardHeader><CardTitle className="text-base"><Wallet className="h-4 w-4 mr-1 inline" /> Request payout</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input type="number" min={1} step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Available: ${formatPrice(summary.pending)}`} />
              <Button onClick={requestPayout} disabled={submitting || summary.pending <= 0}>
                {submitting ? 'Requesting…' : 'Request'}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Commission rate: {Math.round(summary.commissionRate * 100)}% · Price floor {formatPrice(summary.priceFloor)}{summary.priceCeiling ? ` · ceiling ${formatPrice(summary.priceCeiling)}` : ''}
            </div>
            {summary.payouts.length > 0 && (
              <div className="space-y-1 text-sm">
                {summary.payouts.map((p) => (
                  <div key={p.id} className="flex justify-between rounded-lg border px-3 py-2">
                    <span>{formatPrice(p.amount)}</span>
                    <Badge className={p.status === 'PAID' ? 'bg-green-100 text-green-800 border-0' : 'bg-yellow-100 text-yellow-800 border-0'}>{p.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commission ledger */}
        <Card>
          <CardHeader><CardTitle className="text-base"><TrendingUp className="h-4 w-4 mr-1 inline" /> Commission ledger</CardTitle></CardHeader>
          <CardContent>
            {summary.sales.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No referred sales yet. Share your link to start earning.</p>
            ) : (
              <div className="space-y-1 text-sm">
                {summary.sales.map((s) => (
                  <div key={s.id} className="flex justify-between rounded-lg border px-3 py-2">
                    <span>{s.orderNumber}</span>
                    <span className="text-green-600">+{formatPrice(s.commission)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
