'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface AuditLog {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  result: string;
  createdAt: string;
}

const actionColor: Record<string, string> = {
  'product.create': 'bg-green-100 text-green-800',
  'order.update': 'bg-blue-100 text-blue-800',
  'settings.update': 'bg-purple-100 text-purple-800',
  'users.update': 'bg-orange-100 text-orange-800',
  'owners.update': 'bg-cyan-100 text-cyan-800',
  'categories.create': 'bg-green-100 text-green-800',
  'categories.update': 'bg-blue-100 text-blue-800',
  'categories.delete': 'bg-red-100 text-red-800',
  'reseller.update': 'bg-teal-100 text-teal-800',
};

export default function OwnerAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [size] = useState(20);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (query) params.set('search', query);
    const res = await fetch(`/api/owner/audit?${params}`);
    const data = await res.json();
    setLogs(data.logs ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, query, size]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-sm text-muted-foreground">Full history of admin and owner actions.</p>
        </div>
        <form
          className="relative sm:max-w-xs"
          onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search); }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search audit…" className="pl-9" />
        </form>
      </div>

      {loading ? (
        <div className="h-40 w-full skeleton rounded-xl" />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No audit entries.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="px-4 py-3">
                      <Badge className={`border-0 ${actionColor[l.action] ?? 'bg-gray-200 text-gray-700'}`}>
                        {l.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{l.actorEmail}</td>
                    <td className="px-4 py-3">{l.actorRole}</td>
                    <td className="px-4 py-3">
                      {l.resource}
                      {l.resourceId ? <span className="text-xs text-muted-foreground"> · {l.resourceId.slice(0, 8)}</span> : null}
                    </td>
                    <td className="px-4 py-3">{l.result}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} of {totalPages} · {total} entries</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
