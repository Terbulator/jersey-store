import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { parseSectionSettings } from '@/lib/section-schemas';
import { checkOrigin, checkRateLimit } from '@/lib/security';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('homepage_sections')
    .select('id, key, name, enabled, sort_order, settings')
    .order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: 'Could not load sections.' }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
  if (blocked) return blocked;
  const body = await req.json().catch(() => null);
  if (!body?.id || typeof body.id !== 'string') return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  const sb = await adminDataClient();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.enabled !== undefined) {
    if (typeof body.enabled !== 'boolean') return NextResponse.json({ error: 'Invalid enabled flag.' }, { status: 400 });
    updates.enabled = body.enabled;
  }

  if (body.settings !== undefined) {
    let settings: unknown = body.settings;
    if (typeof settings === 'string') {
      try { settings = JSON.parse(settings); }
      catch { return NextResponse.json({ error: 'Invalid settings JSON.' }, { status: 400 }); }
    }
    const { data: section, error: keyErr } = await sb
      .from('homepage_sections').select('key').eq('id', body.id).maybeSingle();
    if (keyErr) return NextResponse.json({ error: 'Could not load section.' }, { status: 500 });
    if (!section?.key) return NextResponse.json({ error: 'Section not found.' }, { status: 404 });
    const parsed = parseSectionSettings(section.key, settings);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    updates.settings = parsed.settings;
  }

  if (body.sort_order !== undefined) {
    const newSort = Number(body.sort_order);
    if (!Number.isFinite(newSort)) return NextResponse.json({ error: 'Invalid sort_order.' }, { status: 400 });

    // Move the section up/down one position relative to its neighbours, then
    // renumber every row 0..n-1 so repeated ±1 moves never create ties.
    const { data: rows, error: loadErr } = await sb.from('homepage_sections').select('id, sort_order');
    if (loadErr) return NextResponse.json({ error: 'Could not load sections.' }, { status: 500 });
    const ordered = (rows ?? []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const curIdx = ordered.findIndex((r) => r.id === body.id);
    if (curIdx === -1) return NextResponse.json({ error: 'Section not found.' }, { status: 404 });
    const targetIdx = Math.min(Math.max(curIdx + (newSort >= (ordered[curIdx].sort_order ?? 0) ? 1 : -1), 0), ordered.length - 1);
    if (curIdx !== targetIdx) {
      const [moved] = ordered.splice(curIdx, 1);
      ordered.splice(targetIdx, 0, moved);
    }
    const movedIndex = ordered.findIndex((r) => r.id === body.id);
    const { error: moveErr } = await sb.from('homepage_sections').update({ ...updates, sort_order: movedIndex }).eq('id', body.id);
    if (moveErr) return NextResponse.json({ error: 'Could not save section.' }, { status: 500 });
    for (const [idx, r] of ordered.entries()) {
      if (r.id === body.id) continue;
      const { error: e } = await sb.from('homepage_sections').update({ sort_order: idx }).eq('id', r.id);
      if (e) return NextResponse.json({ error: 'Could not save section.' }, { status: 500 });
    }
    await logAudit(sb, { actor: session.user.email ?? null, role: session.role, action: 'reorder', resource: 'homepage', resourceId: String(body.id) });
    return NextResponse.json({ ok: true });
  }

  const { error } = await sb.from('homepage_sections').update(updates).eq('id', body.id);
  if (error) return NextResponse.json({ error: 'Could not save section.' }, { status: 500 });
  await logAudit(sb, { actor: session.user.email ?? null, role: session.role, action: 'update', resource: 'homepage', resourceId: String(body.id), summary: Object.keys(updates).join(', ') });
  return NextResponse.json({ ok: true });
}
