'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, Trash2 } from 'lucide-react';
import type { MediaUsage } from '@/lib/media-usage';

export interface MediaRow {
  id: string;
  url: string;
  file_name: string | null;
  alt: string | null;
  kind: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
}

export function MediaManager({ items }: { items: MediaRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(items);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ id: string; url: string; list: MediaUsage[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const visible = rows.filter((r) => {
    if (kind !== 'all' && (r.kind ?? 'image') !== kind) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (r.file_name ?? '').toLowerCase().includes(q) || (r.alt ?? '').toLowerCase().includes(q) || r.url.toLowerCase().includes(q);
  });

  async function upload(file: File) {
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowed.includes(file.type)) { setError('Image must be JPG, PNG, WEBP, GIF, or AVIF.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10 MB.'); return; }
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const up = await fetch('/api/admin/upload?folder=media', { method: 'POST', body: fd });
      const uj = await up.json();
      if (!up.ok || !uj.url) throw new Error(uj?.error ?? 'Upload failed.');
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: uj.url,
          file_name: uj.fileName ?? file.name,
          mime_type: uj.mimeType ?? file.type,
          size_bytes: uj.sizeBytes ?? file.size,
          alt: file.name,
        }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error ?? 'Could not register asset.');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    }
    setUploading(false);
  }

  async function saveAlt(id: string, alt: string) {
    const res = await fetch('/api/admin/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, alt }),
    });
    if (!res.ok) setError('Could not save alt text.');
    else setRows((rs) => rs.map((r) => (r.id === id ? { ...r, alt } : r)));
  }

  async function askDelete(row: MediaRow) {
    setChecking(row.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/media/usage?url=${encodeURIComponent(row.url)}`);
      const j = await res.json();
      setUsage({ id: row.id, url: row.url, list: j.usage ?? [] });
    } catch {
      setError('Could not check usage.');
    }
    setChecking(null);
  }

  async function confirmDelete(force: boolean) {
    if (!usage) return;
    const res = await fetch('/api/admin/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: usage.id, force }),
    });
    const j = await res.json().catch(() => null);
    if (!res.ok) {
      setError(j?.error ?? 'Could not delete asset.');
      setUsage(null);
      return;
    }
    setRows((rs) => rs.filter((r) => r.id !== usage.id));
    setUsage(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, alt text, URL…"
          className="input max-w-xs flex-1 text-[12px]"
          aria-label="Search media"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="input w-auto text-[12px]"
          aria-label="Filter by kind"
        >
          <option value="all">All</option>
          <option value="image">Images</option>
          <option value="video">Video</option>
        </select>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-md bg-[#B3001B] px-3 py-1.5 text-[12px] font-semibold text-[#EFECE6] hover:bg-[#d40022] disabled:opacity-40"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}

      {usage && (
        <div className="rounded-md border border-[#FBBF24]/40 bg-[#FBBF24]/5 p-4" role="alert">
          {usage.list.length > 0 ? (
            <>
              <p className="text-[13px] text-[#EFECE6]">
                This image is used in {usage.list.length} place{usage.list.length === 1 ? '' : 's'}:
              </p>
              <ul className="mt-2 space-y-1 text-[12px] text-[#A8A8A8]">
                {usage.list.map((u, i) => (
                  <li key={i}>• {u.location} — {u.detail}</li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setUsage(null)} className="rounded-md border border-[#292929] px-3 py-1.5 text-[12px] text-[#A8A8A8] hover:text-[#EFECE6]">
                  Keep it
                </button>
                <button onClick={() => confirmDelete(true)} className="rounded-md border border-[#EF4444] px-3 py-1.5 text-[12px] text-[#EF4444]">
                  Delete anyway
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[13px] text-[#EFECE6]">Not used anywhere. Delete this asset?</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setUsage(null)} className="rounded-md border border-[#292929] px-3 py-1.5 text-[12px] text-[#A8A8A8] hover:text-[#EFECE6]">
                  Cancel
                </button>
                <button onClick={() => confirmDelete(false)} className="rounded-md bg-[#EF4444] px-3 py-1.5 text-[12px] font-semibold text-white">
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {visible.length === 0 && (
        <p className="rounded-md border border-[#292929] bg-[#111111] p-8 text-center text-[13px] text-[#666666]">
          No assets match.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((r) => (
          <div key={r.id} className="overflow-hidden rounded-md border border-[#292929] bg-[#111111]">
            <img src={r.url} alt={r.alt ?? ''} className="h-32 w-full object-cover" loading="lazy" />
            <div className="space-y-1.5 p-2.5">
              <p className="truncate text-[11px] text-[#A8A8A8]">{r.file_name ?? 'untitled'}</p>
              <input
                defaultValue={r.alt ?? ''}
                placeholder="Alt text"
                onBlur={(e) => { if (e.target.value !== (r.alt ?? '')) saveAlt(r.id, e.target.value); }}
                className="input w-full text-[11px]"
                aria-label="Alt text"
              />
              <button
                onClick={() => askDelete(r)}
                disabled={checking === r.id}
                className="flex w-full items-center justify-center gap-1 rounded-md border border-[#292929] px-2 py-1.5 text-[11px] text-[#A8A8A8] hover:border-[#EF4444] hover:text-[#EF4444] disabled:opacity-40"
              >
                <Trash2 className="h-3 w-3" /> {checking === r.id ? 'Checking…' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
