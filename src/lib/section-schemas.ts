import { z } from 'zod';

// Rejects javascript:, data:, vbscript: and other executable URL schemes.
// ponytail: blocklist check, not a full URL resolver — relative paths allowed
// deliberately (/shop, #top). Upgrade to a scheme allowlist when rich text
// editors or external link components get added.
export const SAFE_URL_REFINER = (v: string) => !/^(javascript|data|vbscript)\s*:/i.test(v.trimStart());

// Server-side URL gate shared by all CMS write paths.
export function isSafeUrl(v: unknown): boolean {
  return typeof v === 'string' && v.length <= 2000 && SAFE_URL_REFINER(v);
}

const safeUrl = z.string().max(2000).refine(SAFE_URL_REFINER, { message: 'URL scheme not allowed.' });
const optStr = z.string().max(500);
const optUrl = z.string().max(2000).refine(SAFE_URL_REFINER, { message: 'URL scheme not allowed.' });

// Per-section design overrides (settings.design). Colors accept #rrggbb or a
// 'token:<path>' reference so local overrides follow theme changes. Only
// keys the component supports are applied (SECTION_SUPPORT in section-registry).
export const hexOrToken = z.string().max(100).refine(
  (v) => v === '' || /^#[0-9a-fA-F]{6}$/.test(v) || /^token:[a-z0-9.]+$/i.test(v),
  { message: 'Use a #rrggbb color or theme token.' }
);

export const designSchema = z.object({
  bg: hexOrToken.optional(),
  heading_color: hexOrToken.optional(),
  body_color: hexOrToken.optional(),
  accent_color: hexOrToken.optional(),
  heading_size: z.enum(['sm', 'md', 'lg']).optional(),
  padding_y: z.coerce.number().min(0).max(400).optional(),
  padding_y_mobile: z.coerce.number().min(0).max(400).optional(),
  align: z.enum(['left', 'center']).optional(),
  radius: z.coerce.number().min(0).max(48).optional(),
  shadow: z.enum(['none', 'soft', 'lift']).optional(),
  animation: z.enum(['none', 'fade', 'rise', 'scale']).optional(),
  animation_duration: z.coerce.number().min(0.2).max(3).optional(),
  hide_on: z.array(z.enum(['desktop', 'tablet', 'mobile'])).max(3).optional(),
});

export const SECTION_SCHEMAS = {
  hero: z.object({
    eyebrow: optStr.optional(),
    headline: optStr.optional(),
    subheadline: optStr.optional(),
    image_url: optUrl.optional(),
    desktop_image: optUrl.optional(),
    mobile_image: optUrl.optional(),
    cta_text: optStr.optional(),
    cta_url: optUrl.optional(),
    design: designSchema.optional(),
  }),
  story_slides: z.object({
    slides: z.array(
      z.object({
        id: optStr.optional(),
        code: optStr.optional(),
        label: optStr.optional(),
        headline: optStr.optional(),
        sub: optStr.optional(),
        cta: optStr.optional(),
        href: optUrl.optional(),
        image_url: optUrl.optional(),
      })
    ).max(50).optional(),
    design: designSchema.optional(),
  }),
  trust_strip: z.object({
    items: z.array(optStr.max(200)).max(30).optional(),
    design: designSchema.optional(),
  }),
  category_nav: z.object({
    heading: optStr.optional(),
    design: designSchema.optional(),
  }),
  best_sellers: z.object({
    heading: optStr.optional(),
    design: designSchema.optional(),
  }),
  editorial_split: z.object({
    heading: optStr.optional(),
    subheading: optStr.optional(),
    image_url: optUrl.optional(),
    cta_text: optStr.optional(),
    cta_url: optUrl.optional(),
    points: z.array(optStr.max(300)).max(20).optional(),
    design: designSchema.optional(),
  }),
  bundle_section: z.object({
    heading: optStr.optional(),
    subheading: optStr.optional(),
    image_url: optUrl.optional(),
    pricing: z.array(
      z.object({
        label: optStr.optional(),
        items: optStr.optional(),
        price: z.coerce.number().min(0).max(1_000_000).optional(),
        was: z.coerce.number().min(0).max(1_000_000).optional(),
      })
    ).max(20).optional(),
    design: designSchema.optional(),
  }),
  stats_section: z.object({
    stats: z.array(
      z.object({
        value: optStr.max(100).optional(),
        label: optStr.max(200).optional(),
      })
    ).max(20).optional(),
    design: designSchema.optional(),
  }),
  editions_section: z.object({
    heading: optStr.optional(),
    subheading: optStr.optional(),
    design: designSchema.optional(),
  }),
  expert_section: z.object({
    heading: optStr.optional(),
    subheading: optStr.optional(),
    image_url: optUrl.optional(),
    arguments: z.array(
      z.object({
        value: optStr.max(100).optional(),
        label: optStr.max(200).optional(),
      })
    ).max(20).optional(),
    design: designSchema.optional(),
  }),
  newsletter_section: z.object({
    heading: optStr.optional(),
    subheading: optStr.optional(),
    design: designSchema.optional(),
  }),
  review_section: z.object({
    heading: optStr.optional(),
    subheading: optStr.optional(),
    design: designSchema.optional(),
  }),
} as const;

// Validates a section's settings against its typed schema. Unknown keys are
// stripped; bare records and partial payloads are accepted (components fall
// back to defaults for missing fields).
export function parseSectionSettings(
  key: string,
  raw: unknown
): { ok: true; settings: Record<string, unknown> } | { ok: false; error: string } {
  const schema = SECTION_SCHEMAS[key as keyof typeof SECTION_SCHEMAS];
  if (!schema) {
    return { ok: false, error: 'Unknown section key.' };
  }
  const parsed = schema.safeParse(raw ?? {});
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path.join('.') || key;
    return { ok: false, error: `${path}: ${issue?.message ?? 'invalid settings.'}` };
  }
  return { ok: true, settings: parsed.data as Record<string, unknown> };
}