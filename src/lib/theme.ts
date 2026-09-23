import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';

// HEADERR design tokens. Colors are hex; the storefront emits them as
// --th-* CSS variables (globals.css consumes them) so a non-technical owner
// can retheme the whole site without touching code. Defaults reproduce the
// current computed palette exactly — saving an untouched theme changes
// nothing visible.

export const THEME_DEFAULTS = {
  colors: {
    'brand.primary': '#8A2938',
    'brand.primaryHover': '#D4002A',
    'brand.secondary': '#242424',
    'brand.accent': '#B3001B',
    'brand.accentHover': '#D40022',
    'surface.base': '#080808',
    'surface.raised': '#242424',
    'surface.card': '#111111',
    'surface.overlay': '#0A0A0A',
    'surface.ink': '#0A0A0A',
    'surface.light': '#EFECE6',
    'text.primary': '#EFECE6',
    'text.secondary': '#A8A8A8',
    'text.muted': '#777777',
    'text.disabled': '#555555',
    'text.soft': '#55534E',
    'text.inverse': '#EFECE6',
    'text.inverseSoft': '#A8A49B',
    'text.link': '#EFECE6',
    'text.linkHover': '#B3001B',
    'border.subtle': '#292929',
    'border.default': '#3A3A3A',
    'border.strong': '#525252',
    'status.success': '#4ADE80',
    'status.warning': '#FBBF24',
    'status.danger': '#EF4444',
    'status.info': '#60A5FA',
    'interactive.focus': '#8A2938',
    'interactive.selection': '#8A2938',
    'chart.1': '#8A2938',
    'chart.2': '#EFECE6',
    'chart.3': '#60A5FA',
    'chart.4': '#4ADE80',
    'chart.5': '#FBBF24',
    'badge.new': '#8A2938',
    'badge.sale': '#242424',
    'badge.limited': '#EFECE6',
    'overlay.subtle': '#000000',
    'overlay.medium': '#000000',
    'overlay.strong': '#000000',
  },
  fonts: {
    display: "'Instrument Serif', Georgia, 'Times New Roman', serif",
    body: "'Suisse Intl', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    mono: "'ABC Monument Grotesk Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  },
  radius: { sm: 6, md: 12, lg: 16, xl: 24, full: 999 },
  spacing: { sectionY: 80, sectionYMobile: 64 },
  type: {
    display: { size: 96, sizeMobile: 48, weight: 400 },
    h1: { size: 64, sizeMobile: 40, weight: 400 },
    h2: { size: 48, sizeMobile: 32, weight: 400 },
    h3: { size: 32, sizeMobile: 24, weight: 500 },
    h4: { size: 24, sizeMobile: 20, weight: 500 },
    body: { size: 16, sizeMobile: 15, weight: 400 },
    small: { size: 13, sizeMobile: 12, weight: 400 },
    caption: { size: 11, sizeMobile: 10, weight: 500 },
    button: { size: 13, sizeMobile: 12, weight: 500 },
    nav: { size: 11, sizeMobile: 11, weight: 500 },
    label: { size: 10, sizeMobile: 10, weight: 500 },
    mono: { size: 11, sizeMobile: 10, weight: 400 },
  },
} as const;

export type Theme = {
  colors: Record<string, string>;
  fonts: { display: string; body: string; mono: string };
  radius: Record<string, number>;
  spacing: { sectionY: number; sectionYMobile: number };
  type: Record<string, { size: number; sizeMobile: number; weight: number }>;
};

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: 'Use a #rrggbb color.' });
const px = (min: number, max: number) => z.coerce.number().min(min).max(max);

export const FONT_ALLOWLIST = [
  "'Instrument Serif', Georgia, 'Times New Roman', serif",
  "'Suisse Intl', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  "'ABC Monument Grotesk Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  "Inter, system-ui, -apple-system, sans-serif",
  "system-ui, -apple-system, sans-serif",
  "Georgia, 'Times New Roman', serif",
] as const;

// Deep-partial validation for PATCH bodies: every token optional, unknown
// groups rejected, values range-checked.
export const themeSchema = z.object({
  colors: z.record(z.string(), hexColor).optional(),
  fonts: z.object({
    display: z.enum(FONT_ALLOWLIST as unknown as [string, ...string[]]).optional(),
    body: z.enum(FONT_ALLOWLIST as unknown as [string, ...string[]]).optional(),
    mono: z.enum(FONT_ALLOWLIST as unknown as [string, ...string[]]).optional(),
  }).optional(),
  radius: z.record(z.string(), px(0, 48)).optional(),
  spacing: z.object({ sectionY: px(0, 400).optional(), sectionYMobile: px(0, 400).optional() }).optional(),
  type: z.record(z.string(), z.object({ size: px(8, 200).optional(), sizeMobile: px(8, 200).optional(), weight: z.coerce.number().refine((w) => [300, 400, 500, 600, 700].includes(w), { message: 'Weight must be 300–700.' }).optional() })).optional(),
}).strict();

export function mergeTheme(raw: unknown): Theme {
  const base = JSON.parse(JSON.stringify(THEME_DEFAULTS)) as Theme;
  if (!raw || typeof raw !== 'object') return base;
  const p = raw as Record<string, Record<string, unknown>>;
  if (p.colors) {
    for (const [k, v] of Object.entries(p.colors)) {
      if (typeof v === 'string' && k in base.colors) base.colors[k] = v;
    }
  }
  if (p.fonts) {
    for (const k of ['display', 'body', 'mono'] as const) {
      if (typeof p.fonts[k] === 'string') base.fonts[k] = p.fonts[k] as string;
    }
  }
  if (p.radius) {
    for (const [k, v] of Object.entries(p.radius)) {
      if (typeof v === 'number' && k in base.radius) base.radius[k] = v;
    }
  }
  if (p.spacing && typeof p.spacing === 'object') {
    if (typeof p.spacing.sectionY === 'number') base.spacing.sectionY = p.spacing.sectionY;
    if (typeof p.spacing.sectionYMobile === 'number') base.spacing.sectionYMobile = p.spacing.sectionYMobile;
  }
  if (p.type && typeof p.type === 'object') {
    for (const [role, v] of Object.entries(p.type as Record<string, Record<string, number>>)) {
      if (v && typeof v === 'object' && role in base.type) {
        const r = base.type[role];
        if (typeof v.size === 'number') r.size = v.size;
        if (typeof v.sizeMobile === 'number') r.sizeMobile = v.sizeMobile;
        if (typeof v.weight === 'number') r.weight = v.weight;
      }
    }
  }
  return base;
}

export async function getTheme(sb: SupabaseClient): Promise<Theme> {
  const { data } = await sb.from('site_settings').select('value').eq('key', 'theme').maybeSingle();
  return mergeTheme((data as { value?: unknown } | null)?.value);
}

// Section/admin color values may reference a token ('token:brand.primary')
// so local overrides still follow global theme changes.
export function resolveThemeColor(value: string | undefined, theme: Theme): string | undefined {
  if (!value) return undefined;
  if (value.startsWith('token:')) return theme.colors[value.slice(6)] ?? undefined;
  return value;
}

function cssVarName(path: string) {
  return `--th-${path.replace(/\./g, '-')}`;
}

// Full theme stylesheet: token vars, font wiring, and per-role type classes
// (.th-display … .th-mono with mobile sizes) for templates and pages.
export function themeToCss(theme: Theme): string {
  const lines: string[] = [':root{'];
  for (const [k, v] of Object.entries(theme.colors)) lines.push(`${cssVarName(k)}:${v};`);
  for (const [k, v] of Object.entries(theme.radius)) lines.push(`${cssVarName(`radius-${k}`)}:${v}px;`);
  lines.push(`${cssVarName('spacing-section-y')}:${theme.spacing.sectionY}px;`);
  lines.push(`${cssVarName('spacing-section-y-mobile')}:${theme.spacing.sectionYMobile}px;`);
  lines.push(`--font-display:${theme.fonts.display};--font-body:${theme.fonts.body};--font-mono:${theme.fonts.mono};}`);
  lines.push(`body{font-family:var(--font-body);}.font-display,.headline{font-family:var(--font-display);}.font-mono-meta,.eyebrow{font-family:var(--font-mono);}`);
  for (const [role, t] of Object.entries(theme.type)) {
    lines.push(`.th-${role}{font-size:${t.size}px;font-weight:${t.weight};}`);
  }
  const mobile = Object.entries(theme.type)
    .map(([role, t]) => `.th-${role}{font-size:${t.sizeMobile}px;}`)
    .join('');
  lines.push(`@media(max-width:767px){${mobile}}`);
  return lines.join('');
}

// Inline-style vars for <body>: vars inherit into the whole tree.
export function themeToVars(theme: Theme): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries(theme.colors)) vars[cssVarName(k)] = v;
  for (const [k, v] of Object.entries(theme.radius)) vars[cssVarName(`radius-${k}`)] = `${v}px`;
  vars[cssVarName('spacing-section-y')] = `${theme.spacing.sectionY}px`;
  vars[cssVarName('spacing-section-y-mobile')] = `${theme.spacing.sectionYMobile}px`;
  vars['--font-display'] = theme.fonts.display;
  vars['--font-body'] = theme.fonts.body;
  vars['--font-mono'] = theme.fonts.mono;
  return vars;
}
