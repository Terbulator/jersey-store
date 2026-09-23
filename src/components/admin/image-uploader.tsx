'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, ImageIcon, X, Trash2, Link2, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
}

export function ImageUploader({ value, onChange, onRemove, folder = 'homepage' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [assets, setAssets] = useState<Array<{ url: string; file_name: string }>>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowed.includes(file.type)) { setError('Image must be JPG, PNG, WEBP, GIF, or AVIF.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10 MB.'); return; }
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload?folder=' + encodeURIComponent(folder), { method: 'POST', body: fd });
      const j = await res.json();
      if (j.url) { onChange(j.url); setError(''); }
      else setError('Upload failed.');
    } catch { setError('Upload failed.'); }
    setUploading(false);
  }

  async function loadLibrary() {
    setLibraryOpen(true);
    setLibraryLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const j = await res.json();
      setAssets((j.items ?? []).map((it: { url: string; file_name?: string }) => ({ url: it.url, file_name: it.file_name ?? '' })));
    } catch { setAssets([]); }
    setLibraryLoading(false);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) upload(f);
    e.target.value = '';
  }

  return (
    <div className="border border-[#292929] rounded-md bg-[#0D0D0D] overflow-hidden">
      {value ? (
        <div className="relative">
          <img src={value} alt="preview" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
            <button onClick={() => inputRef.current?.click()} disabled={uploading} className="rounded-md bg-[#B3001B] px-3 py-1.5 text-[11px] font-semibold text-[#EFECE6] disabled:opacity-50">
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} Replace
            </button>
            {onRemove && (
              <button onClick={onRemove} className="rounded-md bg-[#EF4444]/80 px-3 py-1.5 text-[11px] font-semibold text-[#EFECE6]">
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            )}
          </div>
        </div>
      ) : null}
      {!value && (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <ImageIcon className="w-8 h-8 text-[#666666]" />
          <p className="text-[11px] text-[#666666]">Upload image</p>
          <p className="text-[9px] text-[#555555]">JPG, PNG, WEBP — max 10 MB</p>
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-[#292929]">
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" onChange={handleFile} className="hidden" />
        <button onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-pill btn-pill-solid text-[10px] flex items-center gap-1">
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} Upload
        </button>
        <button onClick={loadLibrary} className="btn-pill btn-pill-outline text-[10px] flex items-center gap-1">
          <ImageIcon className="w-3 h-3" /> Library
        </button>
        {value && (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input flex-1 text-[10px]"
            placeholder="Or paste URL"
          />
        )}
      </div>
      {error && <p className="px-3 py-1 text-[10px] text-[#EF4444]">{error}</p>}
      {libraryOpen && (
        <div className="border-t border-[#292929] p-3 max-h-60 overflow-y-auto">
          <p className="text-[10px] font-mono-meta uppercase tracking-[0.15em] text-[#666666] mb-2">Media Library</p>
          {libraryLoading ? <p className="text-[11px] text-[#666666]">Loading…</p> : assets.length === 0 ? (
            <p className="text-[11px] text-[#666666]">No assets in library.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {assets.map((a) => (
                <button key={a.url} onClick={() => { onChange(a.url); setLibraryOpen(false); }} className="rounded border border-[#292929] overflow-hidden hover:border-[#B3001B] transition-colors">
                  <img src={a.url} alt={a.file_name} className="w-full h-16 object-cover" />
                  <p className="text-[8px] text-[#666666] truncate px-1">{a.file_name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
