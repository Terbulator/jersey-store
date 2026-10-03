import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDataClient } from '@/lib/admin-session';
import { authorize } from '@/lib/api-guard';
import { checkMutation } from '@/lib/security';
import { isSafeUrl } from '@/lib/section-schemas';
import { readJson } from '@/lib/validate';
import { logAudit } from '@/lib/audit';

// Homepage hero slides. Every field is length-bounded and every URL is scheme-checked
// so an image or CTA cannot smuggle in a javascript:/data: target.

const SLIDE_FIELDS = [
  'eyebrow',
  'headline',
  'subheadline',
  'desktop_image',
  'mobile_image',
  'cta_text',
  'cta_url',
  'sort_order',
] as const;

const URL_FIELDS = ['desktop_image', 'mobile_image', 'cta_url'] as const;

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();

const baseSlide = z.object({
  eyebrow: optionalText(120),
  headline: z.string().trim().min(1).max(200),
  subheadline: optionalText(300),
  desktop_image: optionalText(2000),
  mobile_image: optionalText(2000),
  cta_text: optionalText(80),
  cta_url: optionalText(2000),
  status: z.enum(['draft', 'scheduled', 'active', 'expired']).optional(),
  active: z.boolean().optional(),
  sort_order: z.number().int().min(-10_000).max(10_000).optional(),
});

const createSlide = baseSlide;
const updateSlide = baseSlide.partial().extend({ id: z.string().uuid() });

const rejectUnsafeUrls = (row: Record<string, unknown>): string | null => {
  for (const field of URL_FIELDS) {
    const value = row[field];
    if (value !== undefined && value !== null && value !== '' && !isSafeUrl(String(value))) {
      return 'URL scheme not allowed.';
    }
  }
  return null;
};

export async function POST(req: NextRequest) {
  const guard = await authorize({ permission: 'theme:write' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req);
  if (blocked) return blocked;

  const parsed = createSlide.safeParse(await readJson(req));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue?.path.join('.') || 'slide'}: ${issue?.message}` }, { status: 400 });
  }
  const unsafe = rejectUnsafeUrls(parsed.data as Record<string, unknown>);
  if (unsafe) return NextResponse.json({ error: unsafe }, { status: 400 });

  const row: Record<string, unknown> = {
    headline: parsed.data.headline,
    eyebrow: parsed.data.eyebrow ?? null,
    subheadline: parsed.data.subheadline ?? null,
    desktop_image: parsed.data.desktop_image ?? null,
    mobile_image: parsed.data.mobile_image ?? null,
    cta_text: parsed.data.cta_text ?? null,
    cta_url: parsed.data.cta_url ?? null,
    status: parsed.data.status ?? 'draft',
    active: parsed.data.active ?? false,
    sort_order: parsed.data.sort_order ?? 100,
  };

  const sb = await adminDataClient();
  const { error } = await sb.from('promo_slides').insert(row);
  if (error) return NextResponse.json({ error: 'Could not create slide.' }, { status: 500 });
  await logAudit(sb, {
    actor: guard.actor.user.email ?? null,
    role: guard.actor.role,
    action: 'create',
    resource: 'promo_slides',
    summary: parsed.data.headline,
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const guard = await authorize({ permission: 'theme:write' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req);
  if (blocked) return blocked;

  const parsed = updateSlide.safeParse(await readJson(req));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue?.path.join('.') || 'slide'}: ${issue?.message}` }, { status: 400 });
  }
  const unsafe = rejectUnsafeUrls(parsed.data as Record<string, unknown>);
  if (unsafe) return NextResponse.json({ error: unsafe }, { status: 400 });

  const { id, ...patch } = parsed.data;
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of SLIDE_FIELDS) {
    if (patch[field] !== undefined) updates[field] = patch[field];
  }
  if (patch.status !== undefined) updates.status = patch.status;
  if (patch.active !== undefined) updates.active = patch.active;

  const sb = await adminDataClient();
  const { error } = await sb.from('promo_slides').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: 'Could not save slide.' }, { status: 500 });
  await logAudit(sb, {
    actor: guard.actor.user.email ?? null,
    role: guard.actor.role,
    action: 'update',
    resource: 'promo_slides',
    resourceId: id,
    summary: Object.keys(updates).join(', '),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const guard = await authorize({ permission: 'theme:write' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req, 'expensive');
  if (blocked) return blocked;

  const parsed = z.object({ id: z.string().uuid() }).safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid slide id.' }, { status: 400 });

  const sb = await adminDataClient();
  const { error } = await sb.from('promo_slides').delete().eq('id', parsed.data.id);
  if (error) return NextResponse.json({ error: 'Could not delete slide.' }, { status: 500 });
  await logAudit(sb, {
    actor: guard.actor.user.email ?? null,
    role: guard.actor.role,
    action: 'delete',
    resource: 'promo_slides',
    resourceId: parsed.data.id,
  });
  return NextResponse.json({ ok: true });
}