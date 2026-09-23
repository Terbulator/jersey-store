import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { checkOrigin, checkRateLimit } from '@/lib/security';
import { isSafeUrl } from '@/lib/section-schemas';

const FIELDS = ['eyebrow', 'headline', 'subheadline', 'desktop_image', 'mobile_image', 'cta_text', 'cta_url', 'status', 'active', 'sort_order'];

export async function POST(req: NextRequest) {
  await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
  if (blocked) return blocked;
  const body = await req.json().catch(() => null);
  if (!body?.headline) return NextResponse.json({ error: 'Missing headline.' }, { status: 400 });
  for (const k of ['desktop_image', 'mobile_image', 'cta_url']) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== '' && !isSafeUrl(body[k])) {
      return NextResponse.json({ error: 'URL scheme not allowed.' }, { status: 400 });
    }
  }
  const sb = await adminDataClient();
  const row: Record<string, unknown> = {
    headline: body.headline,
    eyebrow: body.eyebrow ?? null,
    subheadline: body.subheadline ?? null,
    desktop_image: body.desktop_image ?? null,
    mobile_image: body.mobile_image ?? null,
    cta_text: body.cta_text ?? null,
    cta_url: body.cta_url ?? null,
    status: body.status ?? 'draft',
    active: body.active ?? false,
    sort_order: body.sort_order ?? 100,
  };
  const { error } = await sb.from('promo_slides').insert(row);
  if (error) return NextResponse.json({ error: 'Could not create slide.' }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
  if (blocked) return blocked;
  const { id, ...patch } = await req.json();
  for (const k of ['desktop_image', 'mobile_image', 'cta_url']) {
    if (patch[k] !== undefined && patch[k] !== null && patch[k] !== '' && !isSafeUrl(patch[k])) {
      return NextResponse.json({ error: 'URL scheme not allowed.' }, { status: 400 });
    }
  }
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of FIELDS) {
    if (patch[k] !== undefined) updates[k] = patch[k];
  }
  const sb = await adminDataClient();
  const { error } = await sb.from('promo_slides').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: 'Could not save slide.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req, 'expensive');
  if (blocked) return blocked;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  const sb = await adminDataClient();
  const { error } = await sb.from('promo_slides').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Could not delete slide.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}