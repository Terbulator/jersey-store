import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { pageSchema, validatePageSlug } from '@/lib/pages';
import { checkOrigin, checkRateLimit } from '@/lib/security';
import { logAudit } from '@/lib/audit';

// CMS content pages. Slugs become public URLs (/<slug>), so format,
// reserved-name, and uniqueness checks all run server-side.

export async function GET() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('site_pages')
    .select('id, slug, title, published, sort_order, updated_at')
    .order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: 'Could not load pages.' }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
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
  await logAudit(sb, { actor: session.user.email ?? null, role: session.role, action: 'create', resource: 'pages', resourceId: data.id, summary: parsed.data.slug });
  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
  if (blocked) return blocked;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.id || typeof body.id !== 'string') return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
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
  await logAudit(sb, { actor: session.user.email ?? null, role: session.role, action: 'update', resource: 'pages', resourceId: id, summary: Object.keys(parsed.data).join(', ') });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req, 'expensive');
  if (blocked) return blocked;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  const sb = await adminDataClient();
  const { error } = await sb.from('site_pages').delete().eq('id', body.id);
  if (error) return NextResponse.json({ error: 'Could not delete page.' }, { status: 500 });
  await logAudit(sb, { actor: session.user.email ?? null, role: session.role, action: 'delete', resource: 'pages', resourceId: String(body.id) });
  return NextResponse.json({ ok: true });
}
