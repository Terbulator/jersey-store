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
  Copy,
  Undo2,
  Redo2,
  History,
  AlertTriangle,
  Check,
} from 'lucide-react';
import {
  SECTION_ORDER,
  SECTION_META,
  renderHomepageSections,
  type SectionKey,
  type StorefrontData,
} from '@/components/website/section-registry';
import { renderSectionFields, SECTION_ELEMENTS } from '@/components/admin/section-fields';
import { DesignFields } from '@/components/admin/design-fields';
import { SECTION_SUPPORT, type SectionDesign } from '@/components/website/section-shell';
import { ThemeProvider } from '@/components/website/theme-provider';
import { TemplatesProvider } from '@/components/website/theme-provider';
import type { Theme } from '@/lib/theme';
import type { DisplaySettings } from '@/lib/display';
import type { EditorSection } from './page';

type Viewport = 'desktop' | 'tablet' | 'mobile';
type Status = { kind: 'idle' | 'saving' | 'saved' | 'published' | 'error'; message?: string; conflict?: boolean };
interface HistoryVersion { id: string; author_email: string | null; summary: string | null; created_at: string }

const VP_WIDTH: Record<Viewport, number | '100%'> = { desktop: '100%', tablet: 768, mobile: 390 };
const ZOOMS = [0.5, 0.6, 0.75, 0.9, 1];

function serialize(items: EditorSection[]) {
  return JSON.stringify(items.map(({ id, key, name, enabled, sort_order, settings }) => ({ id, key, name, enabled, sort_order, settings })));
}

function deserialize(snap: string): EditorSection[] {
  return JSON.parse(snap) as EditorSection[];
}

// A '*' suffix on a field pattern matches a slug prefix (repeatable fields).
function fieldMatches(slug: string, patterns: string[]) {
  return patterns.some((p) => (p.endsWith('*') ? slug.startsWith(p.slice(0, -1)) : slug === p));
}

// Outline rule for the focused element's fields, scoped to the inspector.
function highlightCss(elId: string, patterns: string[]) {
  const sel = patterns
    .map((p) => (p.endsWith('*') ? `[data-field^="${p.slice(0, -1)}"]` : `[data-field="${p}"]`))
    .join(',');
  if (!sel) return '';
  return `[data-el-focus="${elId}"] ${sel}{outline:1px solid #B3001B;outline-offset:2px;border-radius:6px;}`;
}

export function ThemeEditor({
  initialItems,
  storefrontData,
  sectionsError,
  initialTheme,
  initialDisplay,
  initialUpdatedAt,
}: {
  initialItems: EditorSection[];
  storefrontData: StorefrontData;
  sectionsError: string | null;
  initialTheme: Theme;
  initialDisplay: DisplaySettings;
  initialUpdatedAt: string | null;
}) {
  const router = useRouter();
  const [items, setItems] = useState<EditorSection[]>(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialItems.find((i) => i.key === 'hero')?.id ?? initialItems[0]?.id ?? null
  );
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [zoom, setZoom] = useState<number>(1);
  const [showAdd, setShowAdd] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [histLen, setHistLen] = useState({ past: 0, future: 0 });
  const [baseUpdatedAt, setBaseUpdatedAt] = useState<string | null>(initialUpdatedAt);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<HistoryVersion[]>([]);
  const [versionTotal, setVersionTotal] = useState(0);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [previewSnap, setPreviewSnap] = useState<{ id: string; sections: EditorSection[] } | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const savedSnapshot = useRef(serialize(initialItems));
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const past = useRef<string[]>([]);
  const future = useRef<string[]>([]);
  const burst = useRef(false);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setItems(initialItems);
    savedSnapshot.current = serialize(initialItems);
    past.current = [];
    future.current = [];
    burst.current = false;
    setHistLen({ past: 0, future: 0 });
    setSelectedElement(null);
    setSelectedId((prev) => {
      if (initialItems.some((i) => i.id === prev)) return prev;
      return initialItems.find((i) => i.key === 'hero')?.id ?? initialItems[0]?.id ?? null;
    });
    setBaseUpdatedAt(initialUpdatedAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialItems]);

  const dirty = useMemo(() => serialize(items) !== savedSnapshot.current, [items, savedSnapshot]);
  const enableCount = items.filter((i) => i.enabled).length;
  const selected = items.find((i) => i.id === selectedId) ?? null;
  const elements = selected ? SECTION_ELEMENTS[selected.key] ?? [] : [];
  const activeElement = elements.find((e) => e.id === selectedElement) ?? null;
  const colorTokens = useMemo(
    () => Object.entries(initialTheme.colors).map(([path, value]) => ({ path, value })),
    [initialTheme]
  );
  // Any section may be added any number of times (Shopify-style instances).
  const addable = SECTION_ORDER;

  const enabledSettingsMap = useMemo(() => {
    const m: Record<string, Record<string, unknown> | null> = {};
    for (const i of items) if (i.enabled) m[i.key] = i.settings;
    return m;
  }, [items]);

  function syncHist() {
    setHistLen({ past: past.current.length, future: future.current.length });
  }

  // One undo step for a structural change (add/delete/duplicate/reorder/toggle).
  function commit(next: EditorSection[]) {
    past.current.push(serialize(itemsRef.current));
    if (past.current.length > 50) past.current.shift();
    future.current = [];
    burst.current = false;
    setItems(next);
    syncHist();
  }

  // Keystroke edits share one undo step per typing burst.
  function setItemLive(id: string | null, patch: Partial<EditorSection>) {
    if (!burst.current) {
      past.current.push(serialize(itemsRef.current));
      if (past.current.length > 50) past.current.shift();
      future.current = [];
      burst.current = true;
      syncHist();
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    if (burstTimer.current) clearTimeout(burstTimer.current);
    burstTimer.current = setTimeout(() => { burst.current = false; }, 1500);
  }

  function undo() {
    const prev = past.current.pop();
    if (prev === undefined) return;
    future.current.push(serialize(itemsRef.current));
    burst.current = false;
    setItems(deserialize(prev));
    syncHist();
  }

  function redo() {
    const next = future.current.pop();
    if (next === undefined) return;
    past.current.push(serialize(itemsRef.current));
    burst.current = false;
    setItems(deserialize(next));
    syncHist();
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...itemsRef.current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    commit(next.map((i, idx) => ({ ...i, sort_order: idx })));
  }

  function clearHistory() {
    past.current = [];
    future.current = [];
    burst.current = false;
    syncHist();
  }

  async function reloadLatest(message?: string) {
    try {
      const fresh = await fetch('/api/admin/theme-editor').then((r) => r.json());
      if (fresh?.items) {
        setItems(fresh.items);
        savedSnapshot.current = serialize(fresh.items);
        clearHistory();
        setBaseUpdatedAt(fresh.updatedAt ?? null);
        setSelectedElement(null);
        setStatus(message ? { kind: 'published', message } : { kind: 'idle' });
        router.refresh();
      }
    } catch {
      setStatus({ kind: 'error', message: 'Network error.' });
    }
  }

  async function fetchVersions() {
    setVersionsLoading(true);
    try {
      const j = await fetch('/api/admin/versions?scope=homepage').then((r) => r.json());
      setVersions(j.versions ?? []);
      setVersionTotal(j.total ?? 0);
    } catch {
      setVersions([]);
    }
    setVersionsLoading(false);
  }

  async function previewVersion(id: string) {
    if (previewSnap?.id === id) {
      setPreviewSnap(null);
      return;
    }
    try {
      const j = await fetch(`/api/admin/versions?scope=homepage&id=${id}`).then((r) => r.json());
      const sections = (j.snapshot as { sections?: EditorSection[] } | null)?.sections;
      if (Array.isArray(sections)) setPreviewSnap({ id, sections });
    } catch {
      /* keep list visible */
    }
  }

  async function restoreVersion(id: string) {
    if (confirmRestore !== id) {
      setConfirmRestore(id);
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      confirmTimer.current = setTimeout(() => setConfirmRestore(null), 3000);
      return;
    }
    setConfirmRestore(null);
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/admin/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus({ kind: 'error', message: j?.error ?? 'Could not restore version.' });
        return;
      }
      setShowHistory(false);
      setPreviewSnap(null);
      await reloadLatest('Version restored and published.');
    } catch {
      setStatus({ kind: 'error', message: 'Network error.' });
    }
  }

  function pickElement(id: string | null) {
    setSelectedElement(id);
    if (!id) return;
    const def = elements.find((e) => e.id === id);
    if (!def) return;
    requestAnimationFrame(() => {
      const root = document.getElementById('inspector-fields');
      const nodes = root ? Array.from(root.querySelectorAll('[data-field]')) : [];
      const target = nodes.find((n) => fieldMatches(n.getAttribute('data-field') ?? '', def.fields));
      target?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  const chip = (on: boolean) =>
    `rounded-full border px-2 py-0.5 text-[10px] transition-colors ${on ? 'border-[#B3001B] text-[#B3001B]' : 'border-[#292929] text-[#A8A8A8] hover:text-[#EFECE6]'}`;

  async function api(action: 'draft' | 'publish' | 'discard') {
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/admin/theme-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, sections: items, ...(action === 'publish' ? { baseUpdatedAt } : {}) }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setStatus({ kind: 'error', message: j?.error ?? 'Request failed.', conflict: !!j?.conflict });
        return;
      }
      const j = action === 'publish' ? await res.json().catch(() => null) : null;
      if (action === 'publish') {
        setItems((prev) => prev.map((i) => ({ ...i, hasDraft: false })));
        if (j?.updatedAt) setBaseUpdatedAt(j.updatedAt);
      }
      if (action === 'discard') {
        const fresh = await fetch('/api/admin/theme-editor').then((r) => r.json());
        if (fresh?.items) {
          setItems(fresh.items);
          savedSnapshot.current = serialize(fresh.items);
          clearHistory();
          setConfirmDiscard(false);
          setStatus({ kind: 'published', message: 'Changes discarded.' });
          return;
        }
      }
      savedSnapshot.current = serialize(items);
      clearHistory();
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
    <ThemeProvider theme={initialTheme}>
    <TemplatesProvider display={initialDisplay}>
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
            onClick={undo}
            disabled={!histLen.past}
            className="rounded-md border border-[#292929] p-1.5 text-[#A8A8A8] hover:text-[#EFECE6] disabled:opacity-30"
            aria-label="Undo"
            title="Undo"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!histLen.future}
            className="rounded-md border border-[#292929] p-1.5 text-[#A8A8A8] hover:text-[#EFECE6] disabled:opacity-30"
            aria-label="Redo"
            title="Redo"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-1.5 rounded-md border border-[#292929] px-2.5 py-1.5 text-[11px] transition-colors ${previewMode ? 'text-[#B3001B]' : 'text-[#A8A8A8] hover:text-[#EFECE6]'}`}
          >
            {previewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {previewMode ? 'Exit' : 'Preview'}
          </button>
          <button
            onClick={() => {
              if (!confirmDiscard) {
                setConfirmDiscard(true);
                if (confirmTimer.current) clearTimeout(confirmTimer.current);
                confirmTimer.current = setTimeout(() => setConfirmDiscard(false), 3000);
                return;
              }
              setConfirmDiscard(false);
              api('discard');
            }}
            disabled={!dirty}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] disabled:opacity-40 ${confirmDiscard ? 'border-[#EF4444] text-[#EF4444]' : 'border-[#292929] text-[#A8A8A8] hover:text-[#EFECE6]'}`}
          >
            <Trash2 className="h-3.5 w-3.5" /> {confirmDiscard ? 'Sure?' : 'Discard'}
          </button>
          <button
            onClick={() => { setShowHistory(true); setPreviewSnap(null); fetchVersions(); }}
            className="flex items-center gap-1.5 rounded-md border border-[#292929] px-2.5 py-1.5 text-[11px] text-[#A8A8A8] hover:text-[#EFECE6]"
          >
            <History className="h-3.5 w-3.5" /> History
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

      {status.conflict && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-[#EF4444]/40 bg-[#EF4444]/5 px-3 py-2 text-[12px] text-[#EFECE6]">
          <span>{status.message}</span>
          <button onClick={() => reloadLatest()} className="rounded-md bg-[#EF4444] px-2.5 py-1 text-[11px] font-semibold text-white">
            Reload latest
          </button>
        </div>
      )}

      {previewMode ? (
        <FullPreview items={items} storefrontData={storefrontData} />
      ) : (
        <div className="grid flex-1 gap-3 overflow-hidden lg:grid-cols-[300px_1fr_340px]">
          {/* LEFT — section list */}
          <SectionList
            items={items}
            selectedId={selectedId}
            onSelect={(id) => { setSelectedId(id); setSelectedElement(null); }}
            onToggle={(id) => {
              const target = items.find((i) => i.id === id);
              if (target) commit(items.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i)));
            }}
            onDuplicate={(id) => {
              const idx = items.findIndex((i) => i.id === id);
              if (idx === -1) return;
              const src = items[idx];
              const copy: EditorSection = {
                ...src,
                id: crypto.randomUUID(),
                settings: src.settings ? (JSON.parse(JSON.stringify(src.settings)) as Record<string, unknown>) : null,
                hasDraft: true,
              };
              const next = [...items];
              next.splice(idx + 1, 0, copy);
              commit(next.map((i, n) => ({ ...i, sort_order: n })));
              setSelectedId(copy.id);
            }}
            onDelete={(id) => {
              if (confirmDelete !== id) {
                setConfirmDelete(id);
                if (confirmTimer.current) clearTimeout(confirmTimer.current);
                confirmTimer.current = setTimeout(() => setConfirmDelete(null), 3000);
                return;
              }
              setConfirmDelete(null);
              const next = items.filter((i) => i.id !== id).map((i, n) => ({ ...i, sort_order: n }));
              commit(next);
              if (selectedId === id) setSelectedId(next[0]?.id ?? null);
            }}
            confirmDelete={confirmDelete}
            onReorder={reorder}
            dragIdx={dragIdx}
            setDragIdx={setDragIdx}
            showAdd={showAdd}
            setShowAdd={setShowAdd}
            addable={addable}
            onAdd={(k) => {
              const max = items.reduce((m, i) => Math.max(m, i.sort_order), -1);
              const fresh: EditorSection = { id: crypto.randomUUID(), key: k, name: SECTION_META[k].name, enabled: true, sort_order: max + 1, settings: {}, hasDraft: true };
              commit([...items, fresh]);
              setSelectedId(fresh.id);
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
                {renderHomepageSections(items, enabledSettingsMap, storefrontData, (item, node) => (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(item.id ?? null);
                      const t = (e.target as HTMLElement).closest?.('[data-cms]');
                      setSelectedElement(t?.getAttribute('data-cms') ?? null);
                    }}
                    className={`cursor-pointer transition-shadow ${selectedId === item.id ? 'ring-2 ring-[#B3001B] ring-offset-[3px] ring-offset-[#0a0a0a]' : 'hover:ring-1 hover:ring-[#B3001B]/50'}`}
                  >
                    {node}
                  </div>
                ))}
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
              <div id="inspector-fields" data-el-focus={selectedElement ?? undefined} className="flex-1 space-y-3 overflow-y-auto p-4">
                {activeElement && <style>{highlightCss(activeElement.id, activeElement.fields)}</style>}
                {selected.hasDraft && (
                  <p className="rounded bg-[#60A5FA]/10 px-2 py-1 text-[10px] text-[#60A5FA]">Has an unpublished draft</p>
                )}
                {elements.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <button onClick={() => pickElement(null)} className={chip(!activeElement)}>Section</button>
                    {elements.map((e) => (
                      <button key={e.id} onClick={() => pickElement(e.id)} className={chip(activeElement?.id === e.id)}>{e.label}</button>
                    ))}
                  </div>
                )}
                {activeElement && (
                  <p className="text-[11px] text-[#B3001B]">Editing {activeElement.label} — matching fields are outlined.</p>
                )}
                {renderSectionFields(
                  selected.key,
                  selected.settings ?? {},
                  (k, v) => setItemLive(selected.id, { settings: { ...(selected.settings ?? {}), [k]: v } })
                )}
                <DesignFields
                  design={((selected.settings as Record<string, unknown> | null)?.design as SectionDesign) ?? {}}
                  support={SECTION_SUPPORT[selected.key] ?? []}
                  tokens={colorTokens}
                  onChange={(design) => setItemLive(selected.id, { settings: { ...(selected.settings ?? {}), design } })}
                />
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
      {showHistory && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-label="Version history">
          <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-md border border-[#292929] bg-[#111111]">
            <div className="flex items-center justify-between border-b border-[#292929] px-4 py-3">
              <div>
                <p className="text-[14px] font-medium text-[#EFECE6]">Version history</p>
                <p className="text-[11px] text-[#666666]">Every publish is versioned. Restoring publishes immediately — the replaced state is versioned first.</p>
              </div>
              <button onClick={() => { setShowHistory(false); setPreviewSnap(null); }} className="rounded-md border border-[#292929] px-2.5 py-1.5 text-[11px] text-[#A8A8A8] hover:text-[#EFECE6]">
                Close
              </button>
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-2">
              <div className="min-h-0 overflow-y-auto border-b border-[#292929] md:border-b-0 md:border-r">
                {versionsLoading && <p className="p-4 text-[12px] text-[#666666]">Loading…</p>}
                {!versionsLoading && versions.length === 0 && (
                  <p className="p-4 text-[12px] text-[#666666]">No versions yet — publish to create one.</p>
                )}
                <ul className="divide-y divide-[#1d1d1d]">
                  {versions.map((v, i) => (
                    <li key={v.id} className="flex items-center gap-2 px-4 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-[#EFECE6]">
                          V{versionTotal - i}
                          <span className="ml-2 text-[11px] text-[#666666]">{v.summary ?? 'Published'}</span>
                        </p>
                        <p className="truncate text-[10px] text-[#555555]">
                          {v.author_email ?? 'unknown'} · {new Date(v.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => previewVersion(v.id)}
                        className={`rounded-md border px-2 py-1 text-[11px] ${previewSnap?.id === v.id ? 'border-[#B3001B] text-[#B3001B]' : 'border-[#292929] text-[#A8A8A8] hover:text-[#EFECE6]'}`}
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => restoreVersion(v.id)}
                        className={`rounded-md border px-2 py-1 text-[11px] ${confirmRestore === v.id ? 'border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]' : 'border-[#292929] text-[#A8A8A8] hover:text-[#EFECE6]'}`}
                      >
                        {confirmRestore === v.id ? 'Sure?' : 'Restore'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="min-h-0 overflow-y-auto bg-[#0a0a0a] p-4">
                {!previewSnap && <p className="text-[12px] text-[#666666]">Select Preview on a version to see it exactly as it would render.</p>}
                {previewSnap && renderHomepageSections(previewSnap.sections, {}, storefrontData)}
              </div>
            </div>
          </div>
        </div>
      )}
    </TemplatesProvider>
    </ThemeProvider>
  );
}

function SectionList({
  items,
  selectedId,
  onSelect,
  onToggle,
  onDuplicate,
  onDelete,
  confirmDelete,
  onReorder,
  dragIdx,
  setDragIdx,
  showAdd,
  setShowAdd,
  addable,
  onAdd,
}: {
  items: EditorSection[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onToggle: (id: string | null) => void;
  onDuplicate: (id: string | null) => void;
  onDelete: (id: string | null) => void;
  confirmDelete: string | null;
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
          {items.map((s, i) => {
            const dupCount = items.filter((x) => x.key === s.key).length;
            return (
            <li
              key={s.id ?? `${s.key}-${i}`}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
              onDrop={(e) => { e.preventDefault(); if (dragIdx !== null) onReorder(dragIdx, i); setDragIdx(null); }}
              onDragEnd={() => setDragIdx(null)}
              onClick={() => onSelect(s.id)}
              className={`mb-1 flex cursor-grab items-center gap-2 rounded-md border px-2 py-2 text-[12px] transition-colors active:cursor-grabbing ${
                selectedId === s.id
                  ? 'border-[#B3001B] bg-[#1c1416]'
                  : 'border-transparent hover:bg-[#171717]'
              } ${dragIdx === i ? 'opacity-50' : ''} ${s.enabled ? 'text-[#EFECE6]' : 'text-[#666666]'}`}
            >
              <GripVertical className="h-3.5 w-3.5 shrink-0 text-[#4d4d4d]" />
              <span className="flex-1 truncate">{SECTION_META[s.key as SectionKey]?.label ?? s.name}{dupCount > 1 && <span className="ml-1 text-[10px] text-[#666666]">×{dupCount}</span>}</span>
              {s.hasDraft && <span className="h-1.5 w-1.5 rounded-full bg-[#60A5FA]" title="Has draft" />}
              <button onClick={(e) => { e.stopPropagation(); onDuplicate(s.id); }} className="shrink-0 rounded p-1 text-[#4d4d4d] hover:text-[#EFECE6]" aria-label="Duplicate section" title="Duplicate">
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                className={`shrink-0 rounded p-1 ${confirmDelete !== null && confirmDelete === s.id ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'text-[#4d4d4d] hover:text-[#EF4444]'}`}
                aria-label="Delete section"
                title={confirmDelete !== null && confirmDelete === s.id ? 'Click again to confirm' : 'Delete'}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(s.id); }}
                className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${s.enabled ? 'bg-[#4ADE80]/60' : 'bg-[#292929]'}`}
                aria-label={s.enabled ? 'Disable' : 'Enable'}
              >
                <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${s.enabled ? 'left-3.5' : 'left-0.5'}`} />
              </button>
            </li>
            );
          })}
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
  const settingsMap = Object.fromEntries(items.map((i) => [i.key, i.settings]));
  return (
    <div className="flex-1 overflow-auto rounded-md border border-[#292929] bg-[#0a0a0a] p-6">
      <div className="mx-auto max-w-[1440px]">
        {renderHomepageSections(items, settingsMap, storefrontData)}
      </div>
    </div>
  );
}