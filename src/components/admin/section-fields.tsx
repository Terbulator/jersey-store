'use client';

import { Plus, Trash2 } from 'lucide-react';
import { ImageUploader } from '@/components/admin/image-uploader';

export function fieldSlug(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function Field(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div data-field={fieldSlug(props.label)} className="scroll-mt-2">
      <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">{props.label}</label>
      <input value={props.value} onChange={(e) => props.onChange(e.target.value)} className="input w-full text-[12px]" />
    </div>
  );
}

export function ImageField(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div data-field={fieldSlug(props.label)} className="scroll-mt-2">
      <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">{props.label}</label>
      <ImageUploader value={props.value} onChange={props.onChange} folder="homepage" />
    </div>
  );
}

export function ArrayField(props: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">{props.label}</label>
      {props.values.map((v, i) => (
        <div key={i} data-field={fieldSlug(props.label)} className="flex gap-2 mb-1 scroll-mt-2">
          <input value={v} onChange={(e) => { const n = [...props.values]; n[i] = e.target.value; props.onChange(n); }} className="input flex-1 text-[12px]" />
          <button onClick={() => props.onChange(props.values.filter((_, j) => j !== i))} className="text-[#EF4444]"><Trash2 className="w-3 h-3" /></button>
        </div>
      ))}
      <button onClick={() => props.onChange([...props.values, ''])} className="flex items-center gap-1 text-[11px] text-off-white/60 hover:text-off-white"><Plus className="w-3 h-3" /> Add</button>
    </div>
  );
}

export function ArgumentFields(props: { values: { value: string; label: string }[]; onChange: (v: { value: string; label: string }[]) => void }) {
  return (
    <div data-field="arguments" className="scroll-mt-2">
      <label className="font-mono-meta text-[9px] text-off-white/40 uppercase tracking-[0.15em]">Arguments</label>
      {props.values.map((arg, i) => (
        <div key={i} className="mb-1 space-y-2 border border-[#292929] p-2">
          <Field label="Value" value={arg.value} onChange={(v) => { const n = [...props.values]; n[i] = { ...n[i], value: v }; props.onChange(n); }} />
          <Field label="Label" value={arg.label} onChange={(v) => { const n = [...props.values]; n[i] = { ...n[i], label: v }; props.onChange(n); }} />
          <button onClick={() => props.onChange(props.values.filter((_, j) => j !== i))} className="text-[#EF4444]"><Trash2 className="w-3 h-3" /></button>
        </div>
      ))}
      <button onClick={() => props.onChange([...props.values, { value: '', label: '' }])} className="flex items-center gap-1 text-[11px] text-off-white/60 hover:text-off-white"><Plus className="w-3 h-3" /> Add argument</button>
    </div>
  );
}

// Renders the editable field set for a homepage section key. Shared by the
// legacy section editor and the theme editor's right-hand settings panel.
export function renderSectionFields(
  key: string,
  form: Record<string, unknown>,
  update: (k: string, v: unknown) => void
) {
  switch (key) {
    case 'hero':
      return (
        <>
          <Field label="Eyebrow" value={String(form.eyebrow ?? '')} onChange={(v) => update('eyebrow', v)} />
          <Field label="Headline" value={String(form.headline ?? '')} onChange={(v) => update('headline', v)} />
          <Field label="Subheadline" value={String(form.subheadline ?? '')} onChange={(v) => update('subheadline', v)} />
          <ImageField label="Desktop image" value={String(form.desktop_image ?? form.image_url ?? '')} onChange={(v) => update('desktop_image', v)} />
          <ImageField label="Mobile image" value={String(form.mobile_image ?? '')} onChange={(v) => update('mobile_image', v)} />
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
          <button onClick={() => update('slides', [...slides, { id: crypto.randomUUID(), code: String(slides.length + 1).padStart(2, '0'), label: '', headline: '', sub: '', cta: '', href: '/', image_url: '' }])} className="flex items-center gap-1 text-[11px] text-off-white/60 hover:text-off-white"><Plus className="w-3 h-3" /> Add slide</button>
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
              <div className="w-24"><Field label="Was" value={String(p.was ?? '')} onChange={(v) => { const n = [...pricing]; n[i] = { ...n[i], was: Number(v) }; update('pricing', n); }} /></div>
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
          <ArgumentFields values={(form.arguments as { value: string; label: string }[]) ?? []} onChange={(v) => update('arguments', v)} />
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

// Clickable elements per section. The storefront marks matching nodes with
// data-cms="<element id>"; the inspector maps them to field slugs
// (data-field on each input, derived from its label). A pattern ending in
// '*' matches a slug prefix (e.g. 'item-*' for repeatable Item N fields).
export interface ElementDef {
  id: string;
  label: string;
  fields: string[];
}

export const SECTION_ELEMENTS: Record<string, ElementDef[]> = {
  hero: [
    { id: 'eyebrow', label: 'Eyebrow', fields: ['eyebrow'] },
    { id: 'heading', label: 'Heading', fields: ['headline'] },
    { id: 'subheading', label: 'Subheading', fields: ['subheadline'] },
    { id: 'image', label: 'Image', fields: ['desktop-image', 'mobile-image'] },
    { id: 'button', label: 'Button', fields: ['cta-text', 'cta-url'] },
  ],
  story_slides: [
    { id: 'slides', label: 'Slides', fields: ['label', 'headline', 'cta', 'href', 'image-url'] },
  ],
  trust_strip: [
    { id: 'items', label: 'Items', fields: ['item-*'] },
  ],
  category_nav: [
    { id: 'heading', label: 'Heading', fields: ['heading'] },
  ],
  best_sellers: [
    { id: 'heading', label: 'Heading', fields: ['heading'] },
  ],
  editorial_split: [
    { id: 'heading', label: 'Heading', fields: ['heading', 'subheading'] },
    { id: 'image', label: 'Image', fields: ['image-url'] },
    { id: 'points', label: 'Points', fields: ['points'] },
    { id: 'button', label: 'Button', fields: ['cta-text', 'cta-url'] },
  ],
  bundle_section: [
    { id: 'heading', label: 'Heading', fields: ['heading'] },
    { id: 'image', label: 'Image', fields: ['image-url'] },
    { id: 'pricing', label: 'Pricing tiers', fields: ['label', 'items', 'price', 'was'] },
  ],
  stats_section: [
    { id: 'stats', label: 'Stats', fields: ['value', 'label'] },
  ],
  editions_section: [
    { id: 'heading', label: 'Heading', fields: ['heading', 'subheading'] },
  ],
  expert_section: [
    { id: 'heading', label: 'Heading', fields: ['heading', 'subheading'] },
    { id: 'image', label: 'Image', fields: ['image-url'] },
    { id: 'arguments', label: 'Arguments', fields: ['arguments', 'value', 'label'] },
  ],
  newsletter_section: [
    { id: 'heading', label: 'Heading', fields: ['heading', 'subheading'] },
  ],
  review_section: [
    { id: 'heading', label: 'Heading', fields: ['heading', 'subheading'] },
  ],
};