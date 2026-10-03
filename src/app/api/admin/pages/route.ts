import { NextRequest, NextResponse } from 'next/server';
import { adminDataClient } from '@/lib/admin-session';
import { authorize } from '@/lib/api-guard';
import { pageSchema, validatePageSlug } from '@/lib/pages';
import { checkMutation } from '@/lib/security';
import { isUuid } from '@/lib/validate';
import { logAudit } from '@/lib/audit';

// CMS content pages. Slugs become public URLs (/<slug>), so format,
// reserved-name, and uniqueness checks all run server-side.

export async function GET() {
  const guard = await authorize({ permission: 'pages:read' });
  if (!guard.ok) return guard.response;
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('site_pages')
    .select('id, slug, title, published, sort_order, updated_at')
    .order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: 'Could not load pages.' }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const guard = await authorize({ permission: 'pages:write' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req);
  if (blocked) return blocked;
  const body = await req.json().catch(() => null);
  const parsed = pageSchema.safeParse(body ?? {});
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue?.path.join('.') || 'page'}: ${issue?.message}` }, { status: 400 });
  }
  const reserved = validatePageSlug(parsed.data.slug);
  if (reserved) return NextResponse.json({ error: reserved }, { status: 400 });
  const sb = await adminDataClient();
  const { data: dup } = await sb.from('site_pages').select('id').eq('slug', parsed.data.slug).maybeSingle();
  if (dup) return NextResponse.json({ error: 'That URL is already used by another page.' }, { status: 409 });
  const { data, error } = await sb
    .from('site_pages')
    .insert({ ...parsed.data, updated_at: new Date().toISOString() })
    .select('id')
    .single();
  if (error) return NextResponse.json({ error: 'Could not create page.' }, { status: 500 });
  await logAudit(sb, { actor: guard.actor.user.email ?? null, role: guard.actor.role, action: 'create', resource: 'pages', resourceId: data.id, summary: parsed.data.slug });
  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const guard = await authorize({ permission: 'pages:write' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req);
  if (blocked) return blocked;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!isUuid(body?.id)) return NextResponse.json({ error: 'Invalid page id.' }, { status: 400 });
  const { id, ...rest } = body;
  const parsed = pageSchema.partial().safeParse(rest);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue?.path.join('.') || 'page'}: ${issue?.message}` }, { status: 400 });
  }
  if (parsed.data.slug) {
    const reserved = validatePageSlug(parsed.data.slug);
    if (reserved) return NextResponse.json({ error: reserved }, { status: 400 });
  }
  const sb = await adminDataClient();
  if (parsed.data.slug) {
    const { data: dup } = await sb.from('site_pages').select('id').eq('slug', parsed.data.slug).maybeSingle();
    if (dup && dup.id !== id) return NextResponse.json({ error: 'That URL is already used by another page.' }, { status: 409 });
  }
  const { error } = await sb
    .from('site_pages')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return NextResponse.json({ error: 'Could not save page.' }, { status: 500 });
  await logAudit(sb, { actor: guard.actor.user.email ?? null, role: guard.actor.role, action: 'update', resource: 'pages', resourceId: id, summary: Object.keys(parsed.data).join(', ') });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const guard = await authorize({ permission: 'pages:delete' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req, 'expensive');
  if (blocked) return blocked;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!isUuid(body?.id)) return NextResponse.json({ error: 'Invalid page id.' }, { status: 400 });
  const sb = await adminDataClient();
  const { error } = await sb.from('site_pages').delete().eq('id', body.id);
  if (error) return NextResponse.json({ error: 'Could not delete page.' }, { status: 500 });
  await logAudit(sb, { actor: guard.actor.user.email ?? null, role: guard.actor.role, action: 'delete', resource: 'pages', resourceId: String(body.id) });
  return NextResponse.json({ ok: true });
}
