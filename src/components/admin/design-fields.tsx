'use client';

import type { SectionDesign } from '@/components/website/section-shell';

export interface TokenSwatch {
  path: string;
  value: string;
}

function pretty(path: string) {
  return path
    .split('.')
    .map((p) => p.replace(/^\d$/, (d) => ` ${d}`).trim())
    .join(' · ')
    .replace(/^./, (c) => c.toUpperCase());
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono-meta text-[10px] text-off-white/50 uppercase tracking-[0.18em] pt-1">{children}</p>
  );
}

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">{children}</label>
  );
}

function ColorRow({
  label,
  value,
  tokens,
  onChange,
}: {
  label: string;
  value: string | undefined;
  tokens: TokenSwatch[];
  onChange: (v: string | undefined) => void;
}) {
  const isToken = !!value?.startsWith('token:');
  const hexOk = /^#[0-9a-fA-F]{6}$/.test(value ?? '');
  return (
    <div>
      <RowLabel>{label}</RowLabel>
      <div className="flex items-center gap-2">
        <select
          value={isToken ? value : 'custom'}
          onChange={(e) => onChange(e.target.value === 'custom' ? undefined : e.target.value)}
          className="input min-w-0 flex-1 text-[12px]"
          aria-label={`${label} theme token`}
        >
          <option value="custom">Custom color</option>
          {tokens.map((t) => (
            <option key={t.path} value={`token:${t.path}`}>
              {pretty(t.path)}
            </option>
          ))}
        </select>
        <input
          type="color"
          value={hexOk ? (value as string) : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 shrink-0 cursor-pointer rounded border border-[#292929] bg-transparent"
          aria-label={`${label} custom color`}
        />
        <input
          value={isToken ? '' : (value ?? '')}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder="#rrggbb"
          className="input w-24 shrink-0 text-[12px]"
          aria-label={`${label} hex value`}
        />
      </div>
      {isToken && <p className="mt-1 text-[10px] text-[#666666]">Following {pretty(value!.slice(6))} — change the token in Website → Theme to update everywhere.</p>}
    </div>
  );
}

function NumRow({
  label,
  value,
  hint,
  onChange,
}: {
  label: string;
  value: number | undefined;
  hint?: string;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <div>
      <RowLabel>{label}</RowLabel>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          className="input w-24 text-[12px]"
        />
        <span className="text-[10px] text-[#666666]">px</span>
      </div>
      {hint && <p className="mt-1 text-[10px] text-[#666666]">{hint}</p>}
    </div>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | undefined;
  options: { value: string; label: string }[];
  onChange: (v: string | undefined) => void;
}) {
  return (
    <div>
      <RowLabel>{label}</RowLabel>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="input w-full text-[12px]"
      >
        <option value="">Default</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Generic design controls for a section. Only keys in `support` render —
// every visible control changes the storefront via SectionShell.
export function DesignFields({
  design,
  support,
  tokens,
  onChange,
}: {
  design: SectionDesign;
  support: string[];
  tokens: TokenSwatch[];
  onChange: (d: SectionDesign) => void;
}) {
  const has = (k: string) => support.includes(k);
  const set = (k: keyof SectionDesign, v: unknown) => {
    const next = { ...design };
    if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) delete next[k];
    else (next as Record<string, unknown>)[k] = v;
    onChange(next);
  };
  const hide = new Set(design.hide_on ?? []);
  const toggleHide = (b: 'desktop' | 'tablet' | 'mobile') => {
    const next = new Set(hide);
    if (next.has(b)) next.delete(b);
    else next.add(b);
    set('hide_on', Array.from(next));
  };

  return (
    <div className="space-y-3 border-t border-[#292929] pt-3">
      <GroupLabel>Design</GroupLabel>
      {has('bg') && <ColorRow label="Background" value={design.bg} tokens={tokens} onChange={(v) => set('bg', v)} />}
      {has('heading_color') && <ColorRow label="Heading color" value={design.heading_color} tokens={tokens} onChange={(v) => set('heading_color', v)} />}
      {has('body_color') && <ColorRow label="Text color" value={design.body_color} tokens={tokens} onChange={(v) => set('body_color', v)} />}
      {has('accent_color') && <ColorRow label="Accent color" value={design.accent_color} tokens={tokens} onChange={(v) => set('accent_color', v)} />}
      {has('heading_size') && (
        <SelectRow
          label="Heading size"
          value={design.heading_size}
          options={[
            { value: 'sm', label: 'Small' },
            { value: 'md', label: 'Medium' },
            { value: 'lg', label: 'Large' },
          ]}
          onChange={(v) => set('heading_size', v)}
        />
      )}
      {has('align') && (
        <SelectRow
          label="Alignment"
          value={design.align}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
          ]}
          onChange={(v) => set('align', v)}
        />
      )}
      {has('radius') && <NumRow label="Corner radius" value={design.radius} onChange={(v) => set('radius', v)} />}
      {has('shadow') && (
        <SelectRow
          label="Shadow"
          value={design.shadow}
          options={[
            { value: 'none', label: 'None' },
            { value: 'soft', label: 'Soft' },
            { value: 'lift', label: 'Lifted' },
          ]}
          onChange={(v) => set('shadow', v)}
        />
      )}

      {has('padding') && (
        <>
          <GroupLabel>Spacing</GroupLabel>
          <NumRow label="Vertical padding — desktop" value={design.padding_y} onChange={(v) => set('padding_y', v)} />
          <NumRow
            label="Vertical padding — mobile"
            value={design.padding_y_mobile}
            hint={design.padding_y_mobile == null ? 'Inherited from desktop.' : undefined}
            onChange={(v) => set('padding_y_mobile', v)}
          />
        </>
      )}

      <GroupLabel>Visibility</GroupLabel>
      <div>
        <RowLabel>Show on</RowLabel>
        <div className="flex gap-1.5">
          {(['desktop', 'tablet', 'mobile'] as const).map((b) => {
            const off = hide.has(b);
            return (
              <button
                key={b}
                onClick={() => toggleHide(b)}
                aria-pressed={!off}
                className={`flex-1 rounded-md border px-2 py-1.5 text-[11px] capitalize transition-colors ${off ? 'border-[#292929] text-[#555555]' : 'border-[#B3001B]/60 text-[#EFECE6]'}`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>

      {has('animation') && (
        <>
          <GroupLabel>Animation</GroupLabel>
          <SelectRow
            label="Entrance"
            value={design.animation}
            options={[
              { value: 'none', label: 'None' },
              { value: 'fade', label: 'Fade' },
              { value: 'rise', label: 'Rise' },
              { value: 'scale', label: 'Scale' },
            ]}
            onChange={(v) => set('animation', v)}
          />
          <NumRow label="Duration — seconds" value={design.animation_duration} onChange={(v) => set('animation_duration', v)} />
        </>
      )}
    </div>
  );
}
