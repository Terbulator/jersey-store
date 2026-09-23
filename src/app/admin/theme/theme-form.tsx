'use client';

import { useMemo, useState } from 'react';
import { Save, RotateCcw, Check, AlertTriangle } from 'lucide-react';
import { FONT_ALLOWLIST, THEME_DEFAULTS, type Theme } from '@/lib/theme';

import type { FormStatus as Status } from '@/lib/admin-ui';

const FONT_LABELS: Record<string, string> = {
  [FONT_ALLOWLIST[0]]: 'Instrument Serif (display)',
  [FONT_ALLOWLIST[1]]: 'Suisse Intl (body)',
  [FONT_ALLOWLIST[2]]: 'Monument Mono',
  [FONT_ALLOWLIST[3]]: 'Inter',
  [FONT_ALLOWLIST[4]]: 'System',
  [FONT_ALLOWLIST[5]]: 'Georgia',
};

const GROUP_TITLES: Record<string, string> = {
  brand: 'Brand',
  surface: 'Surfaces',
  text: 'Text',
  border: 'Borders',
  status: 'Status',
  interactive: 'Interactive',
  chart: 'Charts',
  badge: 'Badges',
  overlay: 'Overlays',
};

function pretty(path: string) {
  const [group, name] = path.split('.');
  return `${GROUP_TITLES[group] ?? group} · ${name}`;
}

import { Card } from '@/lib/admin-ui';

export function ThemeForm({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(() => JSON.parse(JSON.stringify(initialTheme)) as Theme);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [confirmReset, setConfirmReset] = useState(false);

  const colorGroups = useMemo(() => {
    const groups: Record<string, [string, string][]> = {};
    for (const [path, value] of Object.entries(theme.colors)) {
      const g = path.split('.')[0];
      (groups[g] ??= []).push([path, value]);
    }
    return groups;
  }, [theme.colors]);

  const setColor = (path: string, v: string) =>
    setTheme((t) => ({ ...t, colors: { ...t.colors, [path]: v } }));
  const dirty = JSON.stringify(theme) !== JSON.stringify(initialTheme);

  async function save() {
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus({ kind: 'error', message: j?.error ?? 'Could not save theme.' });
        return;
      }
      setStatus({ kind: 'saved', message: 'Theme saved — live across the storefront.' });
    } catch {
      setStatus({ kind: 'error', message: 'Network error — try again.' });
    }
  }

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={save}
          disabled={!dirty || status.kind === 'saving'}
          className="flex items-center gap-1.5 rounded-md bg-[#B3001B] px-3 py-1.5 text-[12px] font-semibold text-[#EFECE6] hover:bg-[#d40022] disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" /> {status.kind === 'saving' ? 'Saving…' : 'Save Theme'}
        </button>
        <button
          onClick={() => {
            if (!confirmReset) {
              setConfirmReset(true);
              setTimeout(() => setConfirmReset(false), 3000);
              return;
            }
            setConfirmReset(false);
            setTheme(JSON.parse(JSON.stringify(THEME_DEFAULTS)) as Theme);
          }}
          className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] ${confirmReset ? 'border-[#EF4444] text-[#EF4444]' : 'border-[#292929] text-[#A8A8A8] hover:text-[#EFECE6]'}`}
        >
          <RotateCcw className="h-3.5 w-3.5" /> {confirmReset ? 'Sure?' : 'Reset to defaults'}
        </button>
        {dirty && (
          <span className="flex items-center gap-1 rounded-full bg-[#FBBF24]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#FBBF24]">
            <AlertTriangle className="h-3 w-3" /> Unsaved
          </span>
        )}
        {status.kind === 'saved' && (
          <span className="flex items-center gap-1 text-[12px] text-[#4ADE80]">
            <Check className="h-3.5 w-3.5" /> {status.message}
          </span>
        )}
        {status.kind === 'error' && <span className="text-[12px] text-[#EF4444]">{status.message}</span>}
      </div>

      <Card title="Colors" hint="Click a swatch or type a #rrggbb value. Sections set to follow a token update automatically.">
        {Object.entries(colorGroups).map(([group, rows]) => (
          <div key={group}>
            <p className="mb-1.5 font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">{GROUP_TITLES[group] ?? group}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {rows.map(([path, value]) => (
                <div key={path} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => setColor(path, e.target.value)}
                    className="h-8 w-10 shrink-0 cursor-pointer rounded border border-[#292929] bg-transparent"
                    aria-label={`${pretty(path)} color`}
                  />
                  <input
                    value={value}
                    onChange={(e) => setColor(path, e.target.value)}
                    className="input w-24 shrink-0 text-[12px]"
                    aria-label={`${pretty(path)} hex value`}
                  />
                  <span className="truncate text-[11px] text-[#A8A8A8]">{pretty(path)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>

      <Card title="Typography" hint="Families apply globally; sizes apply through type roles (Display, headings, body…) on templates and pages.">
        {(Object.keys(theme.fonts) as ('display' | 'body' | 'mono')[]).map((k) => (
          <div key={k}>
            <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">{k} font</label>
            <select
              value={theme.fonts[k]}
              onChange={(e) => setTheme((t) => ({ ...t, fonts: { ...t.fonts, [k]: e.target.value } }))}
              className="input w-full text-[12px]"
            >
              {FONT_ALLOWLIST.map((f) => (
                <option key={f} value={f}>
                  {FONT_LABELS[f] ?? f}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">
                <th className="py-1 pr-2">Role</th>
                <th className="py-1 pr-2">Desktop px</th>
                <th className="py-1 pr-2">Mobile px</th>
                <th className="py-1">Weight</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(theme.type).map(([role, t]) => (
                <tr key={role} className="border-t border-[#1d1d1d]">
                  <td className="py-1.5 pr-2 capitalize text-[#A8A8A8]">{role}</td>
                  {(['size', 'sizeMobile'] as const).map((f) => (
                    <td key={f} className="py-1.5 pr-2">
                      <input
                        type="number"
                        min={8}
                        max={200}
                        value={t[f]}
                        onChange={(e) =>
                          setTheme((th) => ({ ...th, type: { ...th.type, [role]: { ...t, [f]: Number(e.target.value) } } }))
                        }
                        className="input w-20 text-[12px]"
                        aria-label={`${role} ${f}`}
                      />
                    </td>
                  ))}
                  <td className="py-1.5">
                    <select
                      value={t.weight}
                      onChange={(e) =>
                        setTheme((th) => ({ ...th, type: { ...th.type, [role]: { ...t, weight: Number(e.target.value) } } }))
                      }
                      className="input w-24 text-[12px]"
                      aria-label={`${role} weight`}
                    >
                      {[300, 400, 500, 600, 700].map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Shape">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {Object.entries(theme.radius).map(([k, v]) => (
            <div key={k}>
              <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">{k}</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={48}
                  value={v}
                  onChange={(e) => setTheme((t) => ({ ...t, radius: { ...t.radius, [k]: Number(e.target.value) } }))}
                  className="input w-20 text-[12px]"
                  aria-label={`${k} radius`}
                />
                <span className="text-[10px] text-[#666666]">px</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Spacing" hint="Default vertical rhythm for sections that opt into theme spacing.">
        <div className="grid grid-cols-2 gap-2">
          {(['sectionY', 'sectionYMobile'] as const).map((k) => (
            <div key={k}>
              <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">
                {k === 'sectionY' ? 'Section padding — desktop' : 'Section padding — mobile'}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={400}
                  value={theme.spacing[k]}
                  onChange={(e) => setTheme((t) => ({ ...t, spacing: { ...t.spacing, [k]: Number(e.target.value) } }))}
                  className="input w-24 text-[12px]"
                  aria-label={k}
                />
                <span className="text-[10px] text-[#666666]">px</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
