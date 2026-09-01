'use client';

import { useCallback, useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PERMISSION_GROUPS } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Override {
  id: string;
  permission: string;
  access: string;
  grantType: string;
  expiresAt: string | null;
  reason: string | null;
  grantedBy: string | null;
}

interface Staff {
  id: string;
  name: string | null;
  email: string;
  role: string;
  resellerTier: string | null;
  overrides: Override[];
}

export default function OwnerPermissions() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [staffSearch, setStaffSearch] = useState('');
  const [overrideFilter, setOverrideFilter] = useState('');
  const [form, setForm] = useState({
    permission: '',
    access: 'GRANT',
    grantType: 'PERMANENT',
    expiresAt: '',
    reason: '',
  });

  const loadStaff = useCallback(async () => {
    const res = await fetch('/api/owner/permissions');
    const d = await res.json();
    const list = d.staff ?? [];
    setStaff(list);
    setLoading(false);
    return list as Staff[];
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const addOverride = async () => {
    if (!selected || !form.permission) {
      toast.error('Select a user and permission first');
      return;
    }
    const res = await fetch('/api/owner/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: selected.id,
        permission: form.permission,
        access: form.access,
        grantType: form.grantType,
        expiresAt: form.grantType === 'TEMPORARY' && form.expiresAt ? form.expiresAt : undefined,
        reason: form.reason || undefined,
      }),
    });
    if (res.ok) {
      toast.success('Permission granted');
      setForm({ permission: '', access: 'GRANT', grantType: 'PERMANENT', expiresAt: '', reason: '' });
      const fresh = await loadStaff();
      setSelected(fresh.find((s) => s.id === selected.id) ?? null);
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to grant');
    }
  };

  const revoke = async (overrideId: string) => {
    const res = await fetch(`/api/owner/permissions/${overrideId}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Permission revoked');
      const fresh = await loadStaff();
      setSelected((prev) => (prev ? fresh.find((s) => s.id === prev.id) ?? null : null));
    } else {
      toast.error('Failed to revoke');
    }
  };

  const roleBadge: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    WORKER: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Permission Console</h1>

      {loading ? (
        <div className="h-40 w-full skeleton rounded-xl" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Staff list */}
          <Card>
            <CardHeader><CardTitle className="text-base">Staff</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Input
                placeholder="Search staff…"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                className="h-8"
              />
              {staff.length === 0 && (
                <p className="text-sm text-muted-foreground">No Admin or Worker accounts yet.</p>
              )}
              {staff
                .filter((s) => {
                  const q = staffSearch.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    (s.name ?? '').toLowerCase().includes(q) ||
                    s.email.toLowerCase().includes(q) ||
                    s.role.toLowerCase().includes(q)
                  );
                })
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelected(s); setOverrideFilter(''); }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      selected?.id === s.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                    )}
                  >
                    <span className="truncate">{s.name ?? s.email}</span>
                    <Badge className={cn('border-0', roleBadge[s.role] ?? '')}>{s.role}</Badge>
                  </button>
                ))}
            </CardContent>
          </Card>

          {/* Detail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4" />
                {selected ? `${selected.name ?? selected.email} — permissions` : 'Select a staff member'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selected ? (
                <p className="text-sm text-muted-foreground">Pick a staff member on the left to manage their unlocks.</p>
              ) : (
                <>
                  {/* Current overrides */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">Active overrides ({selected.overrides.length})</p>
                    <Select
                      value={overrideFilter}
                      onChange={(e) => setOverrideFilter(e.target.value)}
                      className="h-8 w-auto text-xs"
                    >
                      <option value="">All permissions</option>
                      {PERMISSION_GROUPS.map((g) => (
                        <optgroup key={g.module} label={g.module}>
                          {g.permissions.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </optgroup>
                      ))}
                    </Select>
                  </div>
                  {(() => {
                    const filtered = overrideFilter
                      ? selected.overrides.filter((o) => o.permission === overrideFilter)
                      : selected.overrides;
                    if (filtered.length === 0) {
                      return (
                        <p className="text-sm text-muted-foreground">
                          {selected.overrides.length === 0
                            ? 'No overrides yet — everything uses role defaults.'
                            : 'No overrides match the filter.'}
                        </p>
                      );
                    }
                    return (
                      <div className="space-y-2">
                        {filtered.map((o) => (
                          <div key={o.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                            <div>
                              <p className="font-medium">{o.permission}</p>
                              <p className="text-xs text-muted-foreground">
                                {o.access} · {o.grantType}
                                {o.expiresAt ? ` · expires ${new Date(o.expiresAt).toLocaleDateString()}` : ''}
                                {o.reason ? ` · ${o.reason}` : ''}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => revoke(o.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  <div className="rounded-lg bg-muted/40 p-3 space-y-3">
                    <p className="flex items-center gap-1.5 text-sm font-medium"><ShieldCheck className="h-4 w-4" /> Grant a permission</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label>Permission</Label>
                        <Select value={form.permission} onChange={(e) => setForm({ ...form, permission: e.target.value })}>
                          <option value="">Select permission…</option>
                          {PERMISSION_GROUPS.map((g) => (
                            <optgroup key={g.module} label={g.module}>
                              {g.permissions.map((p) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </optgroup>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <Label>Access</Label>
                        <Select value={form.access} onChange={(e) => setForm({ ...form, access: e.target.value })}>
                          <option value="GRANT">Grant</option>
                          <option value="DENY">Deny</option>
                        </Select>
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select value={form.grantType} onChange={(e) => setForm({ ...form, grantType: e.target.value })}>
                          <option value="PERMANENT">Permanent</option>
                          <option value="TEMPORARY">Temporary</option>
                          <option value="ONE_TIME">One-time</option>
                        </Select>
                      </div>
                      {form.grantType === 'TEMPORARY' && (
                        <div className="sm:col-span-2">
                          <Label>Expires</Label>
                          <Input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <Label>Reason (optional)</Label>
                        <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Why this unlock?" />
                      </div>
                    </div>
                    <Button onClick={addOverride} className="w-full">Grant permission</Button>
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
