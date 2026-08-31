'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface WorkerRow {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  owner: { name: string; email: string };
  _count: { tasks: number };
}

export default function AdminWorkers() {
  const [rows, setRows] = useState<WorkerRow[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = query ? `?search=${encodeURIComponent(query)}` : '';
    const res = await fetch(`/api/admin/workers${params}`);
    const data = await res.json();
    setRows(data.workers ?? []);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workers</h1>
        <form
          className="relative sm:max-w-xs"
          onSubmit={(e) => { e.preventDefault(); setQuery(search); }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workers…" className="pl-9" />
        </form>
      </div>

      {loading ? (
        <div className="h-32 w-full skeleton rounded-xl" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No workers found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Tasks</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{w.name}</td>
                  <td className="px-4 py-3">{w.email}</td>
                  <td className="px-4 py-3">{w.owner.name}</td>
                  <td className="px-4 py-3">{w._count.tasks}</td>
                  <td className="px-4 py-3">
                    <Badge className={`border-0 ${w.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                      {w.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
