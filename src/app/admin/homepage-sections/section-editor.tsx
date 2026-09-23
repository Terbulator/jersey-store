'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { ImageUploader } from '@/components/admin/image-uploader';

interface SectionEditorProps {
  sectionKey: string;
  sectionName: string;
  settings: Record<string, unknown> | null;
  onSettingsChange?: (key: string, settings: Record<string, unknown> | null) => void;
}

export function SectionEditor({ sectionKey, sectionName, settings, onSettingsChange }: SectionEditorProps) {
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
        body: JSON.stringify({ id: sectionKey, settings: form }),
      });
      if (!res.ok) { setError('Could not save.'); }
      else { router.refresh(); }
    } catch { setError('Could not save.'); }
    setSaving(false);
  }

  return (
    <div className="border border-[#292929] bg-[#0d0d0d] p-4 mt-2 space-y-3">
      <p className="font-mono-meta text-[10px] text-off-white/50 uppercase tracking-[0.2em] mb-2">Edit: {sectionName}</p>
      {renderFields(sectionKey, form, update)}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={save} disabled={saving} className="btn-pill btn-pill-solid text-[11px]">{saving ? 'Saving…' : 'Save'}</button>
        <button onClick={() => { setForm(settings ?? {}); router.refresh(); }} className="btn-pill btn-pill-outline text-[11px]">Cancel</button>
      </div>
      {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
    </div>
  );
}

function renderFields(key: string, form: Record<string, unknown>, update: (k: string, v: unknown) => void) {
  switch (key) {
    case 'hero':
      return (
        <>
          <Field label="Eyebrow" value={String(form.eyebrow ?? '')} onChange={(v) => update('eyebrow', v)} />
          <Field label="Headline" value={String(form.headline ?? '')} onChange={(v) => update('headline', v)} />
          <Field label="Subheadline" value={String(form.subheadline ?? '')} onChange={(v) => update('subheadline', v)} />
          <ImageField label="Image URL" value={String(form.image_url ?? '')} onChange={(v) => update('image_url', v)} />
          <Field label="CTA text" value={String(form.cta_text ?? '')} onChange={(v) => update('cta_text', v)} />
          <Field label="CTA URL" value={String(form.cta_url ?? '')} onChange={(v) => update('cta_url', v)} />
        </>
      );
    case 'story_slides': {
      const slides: Record<string, unknown>[] = (form.slides as Record<string, unknown>[]) ?? [];
      return (
        <>
          {slides.map((s, i) => (
            <div key={i} className="border border-[#292929] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-mono-meta text-[10px] text-off-white/50">Slide {i + 1}</p>
                <button onClick={() => { const n = [...slides]; n.splice(i, 1); update('slides', n); }} className="text-[#EF4444] hover:text-red"><Trash2 className="w-3 h-3" /></button>
              </div>
              <Field label="Label" value={String(s.label ?? '')} onChange={(v) => { const n = [...slides]; n[i] = { ...n[i], label: v }; update('slides', n); }} />
              <Field label="Headline" value={String(s.headline ?? '')} onChange={(v) => { const n = [...slides]; n[i] = { ...n[i], headline: v }; update('slides', n); }} />
              <Field label="CTA" value={String(s.cta ?? '')} onChange={(v) => { const n = [...slides]; n[i] = { ...n[i], cta: v }; update('slides', n); }} />
              <Field label="Href" value={String(s.href ?? '')} onChange={(v) => { const n = [...slides]; n[i] = { ...n[i], href: v }; update('slides', n); }} />
              <ImageField label="Image URL" value={String(s.image_url ?? '')} onChange={(v) => { const n = [...slides]; n[i] = { ...n[i], image_url: v }; update('slides', n); }} />
            </div>
          ))}
          <button onClick={() => update('slides', [...slides, { label: '', headline: '', sub: '', cta: '', href: '/', image_url: '' }])} className="flex items-center gap-1 text-[11px] text-off-white/60 hover:text-off-white"><Plus className="w-3 h-3" /> Add slide</button>
        </>
      );
    }
    case 'trust_strip': {
      const items: string[] = (form.items as string[]) ?? [];
      return (
        <>
          {items.map((it, i) => (
            <div key={i} className="flex gap-2">
              <Field label={`Item ${i + 1}`} value={it} onChange={(v) => { const n = [...items]; n[i] = v; update('items', n); }} />
              <button onClick={() => { const n = [...items]; n.splice(i, 1); update('items', n); }} className="text-[#EF4444]"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
          <button onClick={() => update('items', [...items, ''])} className="flex items-center gap-1 text-[11px] text-off-white/60 hover:text-off-white"><Plus className="w-3 h-3" /> Add item</button>
        </>
      );
    }
    case 'category_nav':
      return <Field label="Heading" value={String(form.heading ?? '')} onChange={(v) => update('heading', v)} />;
    case 'best_sellers':
      return <Field label="Heading" value={String(form.heading ?? '')} onChange={(v) => update('heading', v)} />;
    case 'editorial_split':
      return (
        <>
          <Field label="Heading" value={String(form.heading ?? '')} onChange={(v) => update('heading', v)} />
          <Field label="Subheading" value={String(form.subheading ?? '')} onChange={(v) => update('subheading', v)} />
          <ImageField label="Image URL" value={String(form.image_url ?? '')} onChange={(v) => update('image_url', v)} />
          <Field label="CTA text" value={String(form.cta_text ?? '')} onChange={(v) => update('cta_text', v)} />
          <Field label="CTA URL" value={String(form.cta_url ?? '')} onChange={(v) => update('cta_url', v)} />
          <ArrayField label="Points" values={(form.points as string[]) ?? []} onChange={(v) => update('points', v)} />
        </>
      );
    case 'bundle_section': {
      const pricing: Record<string, unknown>[] = (form.pricing as Record<string, unknown>[]) ?? [];
      return (
        <>
          <Field label="Heading" value={String(form.heading ?? '')} onChange={(v) => update('heading', v)} />
          <ImageField label="Image URL" value={String(form.image_url ?? '')} onChange={(v) => update('image_url', v)} />
          {pricing.map((p, i) => (
            <div key={i} className="border border-[#292929] p-3 space-y-2 flex gap-2 items-start">
              <div className="flex-1"><Field label="Label" value={String(p.label ?? '')} onChange={(v) => { const n = [...pricing]; n[i] = { ...n[i], label: v }; update('pricing', n); }} /></div>
              <div className="flex-1"><Field label="Items" value={String(p.items ?? '')} onChange={(v) => { const n = [...pricing]; n[i] = { ...n[i], items: v }; update('pricing', n); }} /></div>
              <div className="w-24"><Field label="Price" value={String(p.price ?? '')} onChange={(v) => { const n = [...pricing]; n[i] = { ...n[i], price: Number(v) }; update('pricing', n); }} /></div>
              <button onClick={() => { const n = pricing.filter((_, j) => j !== i); update('pricing', n); }} className="text-[#EF4444]"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
          <button onClick={() => update('pricing', [...pricing, { label: '', items: '', price: 0, was: 0 }])} className="flex items-center gap-1 text-[11px] text-off-white/60 hover:text-off-white"><Plus className="w-3 h-3" /> Add tier</button>
        </>
      );
    }
    case 'stats_section': {
      const stats: Record<string, unknown>[] = (form.stats as Record<string, unknown>[]) ?? [];
      return (
        <>
          {stats.map((s, i) => (
            <div key={i} className="flex gap-2">
              <Field label="Value" value={String(s.value ?? '')} onChange={(v) => { const n = [...stats]; n[i] = { ...n[i], value: v }; update('stats', n); }} />
              <Field label="Label" value={String(s.label ?? '')} onChange={(v) => { const n = [...stats]; n[i] = { ...n[i], label: v }; update('stats', n); }} />
              <button onClick={() => { const n = stats.filter((_, j) => j !== i); update('stats', n); }} className="text-[#EF4444]"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
          <button onClick={() => update('stats', [...stats, { value: '', label: '' }])} className="flex items-center gap-1 text-[11px] text-off-white/60 hover:text-off-white"><Plus className="w-3 h-3" /> Add stat</button>
        </>
      );
    }
    case 'editions_section':
      return (
        <>
          <Field label="Heading" value={String(form.heading ?? '')} onChange={(v) => update('heading', v)} />
          <Field label="Subheading" value={String(form.subheading ?? '')} onChange={(v) => update('subheading', v)} />
        </>
      );
    case 'expert_section':
      return (
        <>
          <Field label="Heading" value={String(form.heading ?? '')} onChange={(v) => update('heading', v)} />
          <Field label="Subheading" value={String(form.subheading ?? '')} onChange={(v) => update('subheading', v)} />
          <ImageField label="Image URL" value={String(form.image_url ?? '')} onChange={(v) => update('image_url', v)} />
          <ArrayField label="Arguments" values={(form.arguments as string[]) ?? []} onChange={(v) => update('arguments', v)} />
        </>
      );
    case 'newsletter_section':
      return (
        <>
          <Field label="Heading" value={String(form.heading ?? '')} onChange={(v) => update('heading', v)} />
          <Field label="Subheading" value={String(form.subheading ?? '')} onChange={(v) => update('subheading', v)} />
        </>
      );
    case 'review_section':
      return (
        <>
          <Field label="Heading" value={String(form.heading ?? '')} onChange={(v) => update('heading', v)} />
          <Field label="Subheading" value={String(form.subheading ?? '')} onChange={(v) => update('subheading', v)} />
        </>
      );
    default:
      return <p className="text-[12px] text-off-white/50">No editor for this section.</p>;
  }
}

function Field(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">{props.label}</label>
      <input value={props.value} onChange={(e) => props.onChange(e.target.value)} className="input w-full text-[12px]" />
    </div>
  );
}

function ImageField(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">{props.label}</label>
      <ImageUploader value={props.value} onChange={props.onChange} folder="homepage" />
    </div>
  );
}

function ArrayField(props: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">{props.label}</label>
      {props.values.map((v, i) => (
        <div key={i} className="flex gap-2 mb-1">
          <input value={v} onChange={(e) => { const n = [...props.values]; n[i] = e.target.value; props.onChange(n); }} className="input flex-1 text-[12px]" />
          <button onClick={() => props.onChange(props.values.filter((_, j) => j !== i))} className="text-[#EF4444]"><Trash2 className="w-3 h-3" /></button>
        </div>
      ))}
      <button onClick={() => props.onChange([...props.values, ''])} className="flex items-center gap-1 text-[11px] text-off-white/60 hover:text-off-white"><Plus className="w-3 h-3" /> Add</button>
    </div>
  );
}
