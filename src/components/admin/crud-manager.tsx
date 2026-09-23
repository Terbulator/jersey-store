'use client';

import { useState } from 'react';
import { Plus, Trash2, Repeat } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ImageUploader } from './image-uploader';

export type CrudField =
  | { key: string; label: string; type: 'text'; placeholder?: string }
  | { key: string; label: string; type: 'textarea'; rows?: number }
  | { key: string; label: string; type: 'number'; placeholder?: string }
  | { key: string; label: string; type: 'select'; options: string[] }
  | { key: string; label: string; type: 'image' };

type Row = Record<string, unknown> & { id: string };

const inputCls =
  'rounded-md border border-[#292929] bg-[#0D0D0D] px-2.5 py-1.5 text-[13px] text-[#EFECE6] placeholder:text-[#666666] focus:border-[#B3001B] focus:outline-none';
const btnCls =
  'rounded-md border border-[#292929] p-1.5 text-[#A8A8A8] hover:border-[#3a3a3a] hover:text-[#EFECE6]';

export function CrudManager({
  items,
  fields,
  apiPath,
  requiredField,
  addLabel = 'Add',
  toggleFields = ['active'],
  toggleLabels = ['On', 'Off'],
  hasSort = true,
}: {
  items: Row[];
  fields: CrudField[];
  apiPath: string;
  requiredField: string;
  addLabel?: string;
  toggleFields?: string[];
  toggleLabels?: [string, string];
  hasSort?: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(
      items.map((it) => [
        it.id,
        Object.fromEntries(fields.map((f) => [f.key, it[f.key] == null ? '' : String(it[f.key])])),
      ])
    )
  );
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, '']))
  );
  const [error, setError] = useState('');

  async function call(method: 'POST' | 'PATCH' | 'DELETE', body: unknown) {
    const res = await fetch(apiPath, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) { setError('Could not save.'); return false; }
    setError('');
    router.refresh();
    return true;
  }

  async function saveField(id: string, key: string, value: string) {
    if (key === requiredField && !value.trim()) return;
    await call('PATCH', { id, [key]: value.trim() });
  }

  async function toggle(id: string, key: string, current: unknown) {
    await call('PATCH', { id, [key]: !current });
  }

  async function moveUp(it: Row) {
    await call('PATCH', { id: it.id, sort_order: Number(it.sort_order ?? 0) - 1 });
  }

  async function remove(id: string) {
    await call('DELETE', { id });
  }

  async function add() {
    if (!String(draft[requiredField] ?? '').trim()) return;
    const body: Record<string, string> = {};
    for (const f of fields) {
      const v = (draft[f.key] ?? '').trim();
      if (v) body[f.key] = v;
    }
    if (await call('POST', body)) {
      setDraft(Object.fromEntries(fields.map((f) => [f.key, ''])));
    }
  }

  const set = (id: string, key: string, value: string) =>
    setValues((vs) => ({ ...vs, [id]: { ...vs[id], [key]: value } }));

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="rounded-md border border-[#292929] bg-[#111111] p-8 text-center text-[13px] text-[#666666]">
          Nothing here yet.
        </div>
      )}

      {items.map((it) => (
        <div key={it.id} className="rounded-md border border-[#292929] bg-[#111111] p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="headline text-[15px] text-[#EFECE6]">
              {String(it[requiredField] ?? 'Untitled')}
            </p>
            <div className="flex items-center gap-1.5">
              {toggleFields.map((k) => (
                <button
                  key={k}
                  onClick={() => toggle(it.id, k, it[k])}
                  aria-label={`Toggle ${k}`}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                    it[k] ? 'bg-[#4ADE80]/15 text-[#4ADE80]' : 'bg-[#292929] text-[#666666]'
                  }`}
                >
                  {it[k] ? toggleLabels[0] : toggleLabels[1]}
                </button>
              ))}
              {hasSort && (
                <button onClick={() => moveUp(it)} aria-label="Move up" className={btnCls}>
                  <Repeat className="h-3.5 w-3.5 -scale-x-100" />
                </button>
              )}
              <button onClick={() => remove(it.id)} aria-label="Delete" className={`${btnCls} text-[#EF4444]`}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {fields
              .filter((f) => f.key !== requiredField)
              .map((f) => {
                const v = values[it.id]?.[f.key] ?? '';
                if (f.type === 'select') {
                  return (
                    <label key={f.key} className="flex items-center gap-2">
                      <span className="w-24 shrink-0 text-[10px] uppercase tracking-widest text-[#666666]">{f.label}</span>
                      <select
                        value={v}
                        onChange={(e) => set(it.id, f.key, e.target.value)}
                        onBlur={(e) => e.target.value.trim() !== it[f.key] && saveField(it.id, f.key, e.target.value)}
                        className={inputCls}
                      >
                        <option value="">—</option>
                        {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </label>
                  );
                }
                if (f.type === 'image') {
                  return (
                    <div key={f.key}>
                      <span className="mb-1 block text-[10px] uppercase tracking-widest text-[#666666]">{f.label}</span>
                      <ImageUploader
                        value={v}
                        onChange={(url) => { set(it.id, f.key, url); saveField(it.id, f.key, url); }}
                        onRemove={() => { set(it.id, f.key, ''); saveField(it.id, f.key, ''); }}
                      />
                    </div>
                  );
                }
                return (
                  <label key={f.key} className="flex items-center gap-2">
                    <span className="w-24 shrink-0 text-[10px] uppercase tracking-widest text-[#666666]">{f.label}</span>
                    <input
                      value={v}
                      placeholder={f.type === 'number' ? '0' : undefined}
                      onChange={(e) => set(it.id, f.key, e.target.value)}
                      onBlur={(e) => e.target.value.trim() !== String(it[f.key] ?? '') && saveField(it.id, f.key, e.target.value)}
                      className={inputCls}
                    />
                  </label>
                );
              })}
          </div>
        </div>
      ))}

      <div className="rounded-md border border-[#292929] bg-[#111111] p-4">
        {fields
          .filter((f) => f.type !== 'select')
          .map((f) => (
            <div key={f.key} className="mb-2.5">
              <p className="mb-1 text-[10px] uppercase tracking-widest text-[#666666]">{f.label}</p>
              {f.type === 'textarea' ? (
                <textarea value={draft[f.key] ?? ''} rows={f.rows ?? 2} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} className={`${inputCls} w-full`} />
              ) : f.type === 'image' ? (
                <ImageUploader value={draft[f.key] ?? ''} onChange={(url) => setDraft((d) => ({ ...d, [f.key]: url }))} />
              ) : (
                <input value={draft[f.key] ?? ''} placeholder={(f as { placeholder?: string }).placeholder} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} className={`${inputCls} w-full`} />
              )}
            </div>
          ))}
        <button
          onClick={add}
          disabled={!String(draft[requiredField] ?? '').trim()}
          className="mt-1 flex items-center gap-1.5 rounded-md bg-[#B3001B] px-3 py-2 text-[12px] font-semibold text-[#EFECE6] disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> {addLabel}
        </button>
      </div>

      {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
    </div>
  );
}
