'use client';

import { useState } from 'react';
import { Repeat, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Announcement {
  id: string;
  text: string;
  active: boolean;
  sort_order: number;
}

export function AnnouncementsManager({ items }: { items: Announcement[] }) {
  const router = useRouter();
  const [texts, setTexts] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((it) => [it.id, it.text]))
  );
  const [newText, setNewText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function update(id: string, patch: Partial<Announcement>) {
    const res = await fetch('/api/admin/announcements', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
    if (!res.ok) {
      setError('Could not save change.');
      return false;
    }
    setError('');
    router.refresh();
    return true;
  }

  async function add() {
    if (!newText.trim()) return;
    setSaving(true);
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText.trim(), active: true, sort_order: 100 }),
    });
    setSaving(false);
    if (!res.ok) {
      setError('Could not add announcement.');
      return;
    }
    setNewText('');
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch('/api/admin/announcements', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) setError('Could not delete announcement.');
    else router.refresh();
  }

  return (
    <div className="space-y-4">
      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-3 rounded-md border border-[#292929] bg-[#111111] p-3">
          <input
            value={texts[it.id] ?? it.text}
            onChange={(e) => setTexts((t) => ({ ...t, [it.id]: e.target.value }))}
            onBlur={(e) => e.target.value.trim() !== it.text && update(it.id, { text: e.target.value.trim() })}
            className="flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-[13px] text-[#EFECE6] outline-none hover:border-[#292929] focus:border-[#B3001B]"
          />
          <button
            onClick={() => update(it.id, { active: !it.active })}
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
              it.active ? 'bg-[#4ADE80]/15 text-[#4ADE80]' : 'bg-[#292929] text-[#666666]'
            }`}
          >
            {it.active ? 'Live' : 'Off'}
          </button>
          <button
            onClick={() => update(it.id, { sort_order: it.sort_order - 1 })}
            aria-label="Move up"
            className="rounded-md border border-[#292929] p-1.5 text-[#A8A8A8] hover:border-[#3a3a3a]"
          >
            <Repeat className="h-3.5 w-3.5 -scale-x-100" />
          </button>
          <button
            onClick={() => remove(it.id)}
            aria-label="Delete"
            className="rounded-md border border-[#292929] p-1.5 text-[#EF4444] hover:border-[#3a3a3a]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="New announcement…"
          className="flex-1 rounded-md border border-[#292929] bg-[#0D0D0D] px-3 py-2 text-[13px] text-[#EFECE6] placeholder:text-[#666666] focus:border-[#B3001B] focus:outline-none"
        />
        <button
          onClick={add}
          disabled={saving || !newText.trim()}
          className="flex items-center gap-1.5 rounded-md bg-[#B3001B] px-3 py-2 text-[12px] font-semibold text-[#EFECE6] disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
      {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
    </div>
  );
}