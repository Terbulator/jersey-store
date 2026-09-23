'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Monitor,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Plus,
  GripVertical,
  Save,
  Send,
  Trash2,
  AlertTriangle,
  Check,
} from 'lucide-react';
import {
  SECTION_ORDER,
  SECTION_META,
  renderSection,
  type SectionKey,
  type StorefrontData,
} from '@/components/website/section-registry';
import { renderSectionFields } from '@/components/admin/section-fields';
import type { EditorSection } from './page';

type Viewport = 'desktop' | 'tablet' | 'mobile';
type Status = { kind: 'idle' | 'saving' | 'saved' | 'published' | 'error'; message?: string };

const VP_WIDTH: Record<Viewport, number | '100%'> = { desktop: '100%', tablet: 768, mobile: 390 };
const ZOOMS = [0.5, 0.6, 0.75, 0.9, 1];

function serialize(items: EditorSection[]) {
  return JSON.stringify(items.map(({ key, name, enabled, sort_order, settings }) => ({ key, name, enabled, sort_order, settings })));
}

export function ThemeEditor({
  initialItems,
  storefrontData,
  sectionsError,
}: {
  initialItems: EditorSection[];
  storefrontData: StorefrontData;
  sectionsError: string | null;
}) {
  const router = useRouter();
  const [items, setItems] = useState<EditorSection[]>(initialItems);
  const [selectedKey, setSelectedKey] = useState<string | null>('hero');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [zoom, setZoom] = useState<number>(1);
  const [showAdd, setShowAdd] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const savedSnapshot = useRef(serialize(initialItems));

  useEffect(() => {
    setItems(initialItems);
    savedSnapshot.current = serialize(initialItems);
  }, [initialItems]);

  const dirty = useMemo(() => serialize(items) !== savedSnapshot.current, [items, savedSnapshot]);
  const enableCount = items.filter((i) => i.enabled).length;
  const selected = items.find((i) => i.key === selectedKey) ?? null;
  const addable = SECTION_ORDER.filter((k) => !items.some((i) => i.key === k));

  const enabledSettingsMap = useMemo(() => {
    const m: Record<string, Record<string, unknown> | null> = {};
    for (const i of items) if (i.enabled) m[i.key] = i.settings;
    return m;
  }, [items]);

  function setItem(key: string, patch: Partial<EditorSection>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((i, idx) => ({ ...i, sort_order: idx }));
    });
  }

  async function api(action: 'draft' | 'publish' | 'discard') {
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/admin/theme-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, sections: items }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setStatus({ kind: 'error', message: j?.error ?? 'Request failed.' });
        return;
      }
      if (action === 'publish') {
        setItems((prev) => prev.map((i) => ({ ...i, hasDraft: false })));
      }
      if (action === 'discard') {
        const fresh = await fetch('/api/admin/theme-editor').then((r) => r.json());
        if (fresh?.items) {
          setItems(fresh.items);
          savedSnapshot.current = serialize(fresh.items);
          setStatus({ kind: 'published', message: 'Changes discarded.' });
          return;
        }
      }
      savedSnapshot.current = serialize(items);
      setStatus(action === 'draft' ? { kind: 'saved', message: 'Draft saved.' } : { kind: 'published', message: 'Published.' });
      router.refresh();
    } catch {
      setStatus({ kind: 'error', message: 'Network error.' });
    }
  }

  const statusColor =
    status.kind === 'error' ? 'text-[#EF4444]'
    : status.kind === 'published' ? 'text-[#4ADE80]'
    : status.kind === 'saved' ? 'text-[#60A5FA]'
    : 'text-[#666666]';

  if (sectionsError) {
    return <p className="rounded-md border border-[#292929] p-4 text-[#EF4444]">Could not load sections: {sectionsError}</p>;
  }

  return (
    <div className="flex h-[calc(100vh-88px)] flex-col gap-3" style={{ maxWidth: 'none' }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#292929] bg-[#111111] px-3 py-2">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-lg text-[#EFECE6]">Theme Editor</h1>
          <span className="hidden text-[11px] text-[#666666] md:inline">{enableCount} sections on homepage</span>
          {dirty && (
            <span className="flex items-center gap-1 rounded-full bg-[#FBBF24]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#FBBF24]">
              <AlertTriangle className="h-3 w-3" /> Unsaved
            </span>
          )}
          {status.kind !== 'idle' && !dirty && (
            <span className={`flex items-center gap-1 text-[11px] ${statusColor}`}>
              <Check className="h-3 w-3" /> {status.message}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-1.5 rounded-md border border-[#292929] px-2.5 py-1.5 text-[11px] transition-colors ${previewMode ? 'text-[#B3001B]' : 'text-[#A8A8A8] hover:text-[#EFECE6]'}`}
          >
            {previewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {previewMode ? 'Exit' : 'Preview'}
          </button>
          <button
            onClick={() => api('discard')}
            disabled={!dirty}
            className="flex items-center gap-1.5 rounded-md border border-[#292929] px-2.5 py-1.5 text-[11px] text-[#A8A8A8] hover:text-[#EFECE6] disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" /> Discard
          </button>
          <button
            onClick={() => api('draft')}
            disabled={!dirty}
            className="flex items-center gap-1.5 rounded-md border border-[#60A5FA]/40 px-2.5 py-1.5 text-[11px] text-[#60A5FA] hover:bg-[#60A5FA]/10 disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" /> Save Draft
          </button>
          <button
            onClick={() => api('publish')}
            disabled={!dirty}
            className="flex items-center gap-1.5 rounded-md bg-[#B3001B] px-3 py-1.5 text-[11px] font-semibold text-[#EFECE6] hover:bg-[#d40022] disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" /> Publish
          </button>
        </div>
      </div>

      {previewMode ? (
        <FullPreview items={items} storefrontData={storefrontData} />
      ) : (
        <div className="grid flex-1 gap-3 overflow-hidden lg:grid-cols-[300px_1fr_340px]">
          {/* LEFT — section list */}
          <SectionList
            items={items}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
            onToggle={(key) => setItem(key, { enabled: !items.find((i) => i.key === key)?.enabled })}
            onReorder={reorder}
            dragIdx={dragIdx}
            setDragIdx={setDragIdx}
            showAdd={showAdd}
            setShowAdd={setShowAdd}
            addable={addable}
            onAdd={(k) => {
              const max = items.reduce((m, i) => Math.max(m, i.sort_order), -1);
              setItems([...items, { key: k, name: SECTION_META[k].name, enabled: true, sort_order: max + 1, settings: {}, hasDraft: true }]);
              setSelectedKey(k);
              setShowAdd(false);
            }}
          />

          {/* Center — real storefront preview */}
          <div className="flex min-w-0 flex-col overflow-hidden rounded-md border border-[#292929] bg-[#0a0a0a]">
            <PreviewToolbar viewport={viewport} setViewport={setViewport} zoom={zoom} setZoom={setZoom} />
            <div className="flex-1 overflow-auto p-4">
              <div
                className="mx-auto min-h-full"
                style={{
                  width: VP_WIDTH[viewport] === '100%' ? '100%' : VP_WIDTH[viewport],
                  maxWidth: viewport === 'desktop' ? 1440 : VP_WIDTH[viewport],
                  zoom,
                }}
              >
                {items.filter((i) => i.enabled).map((i) => (
                  <div
                    key={i.key}
                    onClick={(e) => { e.stopPropagation(); setSelectedKey(i.key); }}
                    className={`cursor-pointer transition-shadow ${selectedKey === i.key ? 'ring-2 ring-[#B3001B] ring-offset-[3px] ring-offset-[#0a0a0a]' : 'hover:ring-1 hover:ring-[#B3001B]/50'}`}
                  >
                    {renderSection(i.key as SectionKey, i.settings, storefrontData)}
                  </div>
                ))}
                {items.filter((i) => i.enabled).length === 0 && (
                  <div className="flex h-48 items-center justify-center text-[12px] text-[#666666]">No sections enabled.</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — selected section settings */}
          <div className="flex min-h-0 flex-col overflow-hidden rounded-md border border-[#292929] bg-[#111111]">
            <div className="border-b border-[#292929] px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#666666]">Settings</p>
              {selected && <p className="mt-0.5 text-[14px] font-medium text-[#EFECE6]">{SECTION_META[selected.key as SectionKey]?.label ?? selected.name}</p>}
            </div>
            {selected ? (
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {selected.hasDraft && (
                  <p className="rounded bg-[#60A5FA]/10 px-2 py-1 text-[10px] text-[#60A5FA]">Has an unpublished draft</p>
                )}
                {renderSectionFields(
                  selected.key,
                  selected.settings ?? {},
                  (k, v) => setItem(selected.key, { settings: { ...(selected.settings ?? {}), [k]: v } })
                )}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center p-6 text-center text-[12px] text-[#666666]">
                Select a section in the list or on the storefront to edit its settings.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionList({
  items,
  selectedKey,
  onSelect,
  onToggle,
  onReorder,
  dragIdx,
  setDragIdx,
  showAdd,
  setShowAdd,
  addable,
  onAdd,
}: {
  items: EditorSection[];
  selectedKey: string | null;
  onSelect: (k: string) => void;
  onToggle: (k: string) => void;
  onReorder: (from: number, to: number) => void;
  dragIdx: number | null;
  setDragIdx: (n: number | null) => void;
  showAdd: boolean;
  setShowAdd: (b: boolean) => void;
  addable: SectionKey[];
  onAdd: (k: SectionKey) => void;
}) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-md border border-[#292929] bg-[#111111]">
      <div className="flex items-center justify-between border-b border-[#292929] px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#666666]">Homepage Sections</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ul className="p-2">
          {items.map((s, i) => (
            <li
              key={s.key}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
              onDrop={(e) => { e.preventDefault(); if (dragIdx !== null) onReorder(dragIdx, i); setDragIdx(null); }}
              onDragEnd={() => setDragIdx(null)}
              onClick={() => onSelect(s.key)}
              className={`mb-1 flex cursor-grab items-center gap-2 rounded-md border px-2 py-2 text-[12px] transition-colors active:cursor-grabbing ${
                selectedKey === s.key
                  ? 'border-[#B3001B] bg-[#1c1416]'
                  : 'border-transparent hover:bg-[#171717]'
              } ${dragIdx === i ? 'opacity-50' : ''} ${s.enabled ? 'text-[#EFECE6]' : 'text-[#666666]'}`}
            >
              <GripVertical className="h-3.5 w-3.5 shrink-0 text-[#4d4d4d]" />
              <span className="flex-1 truncate">{SECTION_META[s.key as SectionKey]?.label ?? s.name}</span>
              {s.hasDraft && <span className="h-1.5 w-1.5 rounded-full bg-[#60A5FA]" title="Has draft" />}
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(s.key); }}
                className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${s.enabled ? 'bg-[#4ADE80]/60' : 'bg-[#292929]'}`}
                aria-label={s.enabled ? 'Disable' : 'Enable'}
              >
                <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${s.enabled ? 'left-3.5' : 'left-0.5'}`} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-[#292929] p-2">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#292929] px-2 py-2 text-[11px] text-[#A8A8A8] hover:border-[#B3001B] hover:text-[#EFECE6]"
        >
          <Plus className="h-3.5 w-3.5" /> Add Section
        </button>
        {showAdd && (
          <ul className="mt-1 space-y-0.5 rounded-md border border-[#292929] bg-[#0d0d0d] p-1">
            {addable.length === 0 && <li className="px-2 py-1.5 text-[11px] text-[#666666]">All sections added.</li>}
            {addable.map((k) => (
              <li key={k}>
                <button
                  onClick={() => onAdd(k)}
                  className="w-full rounded px-2 py-1.5 text-left text-[12px] text-[#EFECE6] hover:bg-[#171717]"
                >
                  {SECTION_META[k].label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PreviewToolbar({
  viewport,
  setViewport,
  zoom,
  setZoom,
}: {
  viewport: Viewport;
  setViewport: (v: Viewport) => void;
  zoom: number;
  setZoom: (z: number) => void;
}) {
  const zi = ZOOMS.indexOf(zoom);
  return (
    <div className="flex items-center justify-between border-b border-[#292929] bg-[#0d0d0d] px-3 py-2">
      <div className="flex items-center gap-1">
        {(
          [
            ['desktop', Monitor],
            ['tablet', Tablet],
            ['mobile', Smartphone],
          ] as [Viewport, typeof Monitor][]
        ).map(([k, Icon]) => (
          <button
            key={k}
            onClick={() => setViewport(k)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] ${viewport === k ? 'bg-[#B3001B]/15 text-[#B3001B]' : 'text-[#666666] hover:text-[#EFECE6]'}`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden capitalize sm:inline">{k}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setZoom(Math.max(0.5, ZOOMS[Math.max(0, zi - 1)]))}
          className="rounded p-1 text-[#666666] hover:text-[#EFECE6]"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <span className="w-8 text-center text-[10px] text-[#666666]">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(Math.min(1, ZOOMS[Math.min(ZOOMS.length - 1, zi + 1)]))}
          className="rounded p-1 text-[#666666] hover:text-[#EFECE6]"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function FullPreview({ items, storefrontData }: { items: EditorSection[]; storefrontData: StorefrontData }) {
  return (
    <div className="flex-1 overflow-auto rounded-md border border-[#292929] bg-[#0a0a0a] p-6">
      <div className="mx-auto max-w-[1440px]">
        {items.filter((i) => i.enabled).map((i) => (
          <div key={i.key}>{renderSection(i.key as SectionKey, i.settings, storefrontData)}</div>
        ))}
        {items.filter((i) => i.enabled).length === 0 && (
          <div className="flex h-48 items-center justify-center text-[12px] text-[#666666]">No sections enabled.</div>
        )}
      </div>
    </div>
  );
}