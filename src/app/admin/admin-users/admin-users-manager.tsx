'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ROLES = ['ADMIN', 'OWNER', 'WORKER'];

export function AdminUsersManager({ items }: { items: { id: string; email: string; role: string }[] }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [error, setError] = useState('');

  async function call(method: 'POST' | 'PATCH' | 'DELETE', body: unknown) {
    const res = await fetch('/api/admin/admin-users', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      setError(json?.error ?? 'Could not save.');
      return false;
    }
    setError('');
    router.refresh();
    return true;
  }

  async function setRoleFor(id: string, value: string) {
    await call('PATCH', { id, role: value });
  }

  async function remove(id: string) {
    await call('DELETE', { id });
  }

  async function add() {
    if (!email.trim()) return;
    if (await call('POST', { email, role })) setEmail('');
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="rounded-md border border-[#292929] bg-[#111111] p-8 text-center text-[13px] text-[#666666]">
          No admins yet.
        </div>
      )}

      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-3 rounded-md border border-[#292929] bg-[#111111] p-4">
          <p className="headline flex-1 text-[15px] text-[#EFECE6]">{it.email}</p>
          <select
            value={it.role}
            onChange={(e) => e.target.value !== it.role && setRoleFor(it.id, e.target.value)}
            className="rounded-md border border-[#292929] bg-[#0D0D0D] px-2 py-1.5 text-[12px] text-[#EFECE6] focus:border-[#B3001B] focus:outline-none"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button onClick={() => remove(it.id)} aria-label="Remove" className="rounded-md border border-[#292929] p-1.5 text-[#EF4444] hover:border-[#3a3a3a]">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      <div className="flex flex-wrap items-end gap-2 rounded-md border border-[#292929] bg-[#111111] p-4">
        <label className="flex-1 min-w-[220px]">
          <p className="mb-1 text-[10px] uppercase tracking-widest text-[#666666]">Email</p>
          <input
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-[#292929] bg-[#0D0D0D] px-2.5 py-1.5 text-[13px] text-[#EFECE6] placeholder:text-[#666666] focus:border-[#B3001B] focus:outline-none"
            placeholder="user@email.com"
          />
        </label>
        <label>
          <p className="mb-1 text-[10px] uppercase tracking-widest text-[#666666]">Role</p>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-md border border-[#292929] bg-[#0D0D0D] px-2 py-[9px] text-[12px] text-[#EFECE6] focus:border-[#B3001B] focus:outline-none"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={add}
          disabled={!email.trim()}
          className="flex items-center gap-1.5 rounded-md bg-[#B3001B] px-3 py-2 text-[12px] font-semibold text-[#EFECE6] disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add admin
        </button>
      </div>

      {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
    </div>
  );
}