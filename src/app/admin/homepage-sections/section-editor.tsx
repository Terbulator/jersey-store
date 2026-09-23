'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { renderSectionFields } from '@/components/admin/section-fields';

interface SectionEditorProps {
  sectionId: string;
  sectionKey: string;
  sectionName: string;
  settings: Record<string, unknown> | null;
  onSettingsChange?: (key: string, settings: Record<string, unknown> | null) => void;
}

export function SectionEditor({ sectionId, sectionKey, sectionName, settings, onSettingsChange }: SectionEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, unknown>>(settings ?? {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(settings ?? {}); }, [settings]);

  function update<K extends string>(key: K, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (onSettingsChange) {
      const next = { ...form, [key]: value };
      onSettingsChange(sectionKey, next);
    }
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/homepage-sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sectionId, settings: form }),
      });
      if (!res.ok) { setError('Could not save.'); }
      else { router.refresh(); }
    } catch { setError('Could not save.'); }
    setSaving(false);
  }

  return (
    <div className="border border-[#292929] bg-[#0d0d0d] p-4 mt-2 space-y-3">
      <p className="font-mono-meta text-[10px] text-off-white/50 uppercase tracking-[0.2em] mb-2">Edit: {sectionName}</p>
      {renderSectionFields(sectionKey, form, update)}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={save} disabled={saving} className="btn-pill btn-pill-solid text-[11px]">{saving ? 'Saving…' : 'Save'}</button>
        <button onClick={() => { setForm(settings ?? {}); router.refresh(); }} className="btn-pill btn-pill-outline text-[11px]">Cancel</button>
      </div>
      {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
    </div>
  );
}