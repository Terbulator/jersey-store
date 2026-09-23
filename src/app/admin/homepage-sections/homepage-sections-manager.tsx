'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SectionEditor } from './section-editor';

export interface HomepageSectionRow {
  id: string;
  key: string;
  name: string;
  enabled: boolean;
  sort_order: number;
}

export function HomepageSectionsManager({ items, settingsMap }: { items: HomepageSectionRow[]; settingsMap: Record<string, Record<string, unknown> | null> }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  async function act(id: string, patch: Partial<HomepageSectionRow>) {
    setBusy(id);
    const res = await fetch('/api/admin/homepage-sections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
    setBusy(null);
    if (!res.ok) { setError('Could not save section.'); return; }
    setError('');
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-md border border-[#292929] bg-[#111111]">
      <ul className="divide-y divide-[#292929]">
        {items.map((s, i) => (
          <li key={s.id} className="border-b border-[#292929] last:border-b-0">
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#171717]">
              <div className="flex flex-col">
                <button onClick={() => act(s.id, { sort_order: s.sort_order - 1 })} disabled={i === 0 || busy === s.id} aria-label="Move up" className="rounded p-0.5 text-[#666666] hover:text-[#EFECE6] disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => act(s.id, { sort_order: s.sort_order + 1 })} disabled={i === items.length - 1 || busy === s.id} aria-label="Move down" className="rounded p-0.5 text-[#666666] hover:text-[#EFECE6] disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[#EFECE6]">{s.name}</p>
                <p className="font-mono text-[10px] text-[#666666]">{s.key}</p>
              </div>
              <button onClick={() => setEditing(editing === s.id ? null : s.id)} className="p-1.5 text-[#666666] hover:text-off-white transition-colors" title="Edit" aria-label={`Edit ${s.name}`}><Edit3 className="h-3.5 w-3.5" /></button>
              <button onClick={() => act(s.id, { enabled: !s.enabled })} disabled={busy === s.id} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase transition-colors disabled:opacity-50 ${s.enabled ? 'bg-[#4ADE80]/15 text-[#4ADE80]' : 'border border-[#292929] text-[#666666]'}`}>
                {s.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {s.enabled ? 'On' : 'Off'}
              </button>
            </div>
            {editing === s.id && (
              <SectionEditor sectionKey={s.key} sectionName={s.name} settings={settingsMap[s.key] ?? null} />
            )}
          </li>
        ))}
      </ul>
      {error && <p className="border-t border-[#292929] px-4 py-2 text-[12px] text-[#EF4444]">{error}</p>}
    </div>
  );
}
