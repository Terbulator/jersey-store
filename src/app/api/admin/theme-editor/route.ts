import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { parseSectionSettings } from '@/lib/section-schemas';
import { recordVersion } from '@/lib/versions';
import { checkOrigin, checkRateLimit } from '@/lib/security';
import { logAudit } from '@/lib/audit';

export interface ThemeSectionDTO {
  id: string | null;
  key: string;
  name: string;
  enabled: boolean;
  sort_order: number;
  settings: Record<string, unknown> | null;
  hasDraft: boolean;
}

export async function GET() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('homepage_sections')
    .select('id, key, name, enabled, sort_order, settings, draft_enabled, draft_sort_order, draft_settings, updated_at')
    .order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: 'Could not load sections.' }, { status: 500 });

  const items: ThemeSectionDTO[] = (data ?? []).map((s) => {
    const draftEnabled = s.draft_enabled ?? null;
    const draftOrder = s.draft_sort_order ?? null;
    const draftSettings = (s.draft_settings as Record<string, unknown> | null) ?? null;
    const hasDraft = draftEnabled !== null || draftOrder !== null || draftSettings !== null;
    return {
      id: s.id as string,
      key: s.key as string,
      name: s.name as string,
      enabled: draftEnabled ?? !!s.enabled,
      sort_order: draftOrder ?? (s.sort_order as number),
      settings: draftSettings ?? ((s.settings as Record<string, unknown>) ?? null),
      hasDraft,
    };
  });
  items.sort((a, b) => a.sort_order - b.sort_order);
  const updatedAt = (data ?? []).reduce<string | null>(
    (max, s) => {
      const t = (s as { updated_at?: string }).updated_at ?? null;
      return !max || (t && t > max) ? t ?? max : max;
    },
    null
  );
  return NextResponse.json({ items, updatedAt });
}

interface ClientSection {
  id?: string | null;
  key: string;
  name: string;
  enabled: boolean;
  sort_order: number;
  settings: Record<string, unknown> | null;
}

// Client-generated row ids are uuids; anything else is rejected before it
// can reach the query builder.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Save the working config as draft (no changes to live/published state).
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req, 'expensive');
  if (blocked) return blocked;
  const body = await req.json().catch(() => null);
  if (!body || !['draft', 'publish', 'discard'].includes(body.action)) {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  }

  const sb = await adminDataClient();
  const action = body.action as 'draft' | 'publish' | 'discard';

  const sections: ClientSection[] = Array.isArray(body.sections) ? body.sections : [];
  if (action === 'publish' && sections.length === 0) {
    return NextResponse.json({ error: 'Nothing to publish.' }, { status: 400 });
  }
  for (const s of sections) {
    if (!s.key || typeof s.key !== 'string') return NextResponse.json({ error: 'Missing section key.' }, { status: 400 });
    if (s.id != null && (typeof s.id !== 'string' || !UUID_RE.test(s.id))) {
      return NextResponse.json({ error: `section ${s.key}: invalid id.` }, { status: 400 });
    }
    const order = Number(s.sort_order);
    if (!Number.isFinite(order)) return NextResponse.json({ error: `section ${s.key}: invalid sort_order.` }, { status: 400 });
    s.sort_order = order;
    const parsed = parseSectionSettings(s.key, s.settings ?? {});
    if (!parsed.ok) return NextResponse.json({ error: `section ${s.key}: ${parsed.error}` }, { status: 400 });
    s.settings = parsed.settings;
  }

  if (action === 'discard') {
    // Clear every row carrying any draft state — not just settings drafts,
    // or enable/order/delete-only drafts would linger as stale flags.
    const { error } = await sb
      .from('homepage_sections')
      .update({ draft_enabled: null, draft_sort_order: null, draft_settings: null, draft_deleted: null, updated_at: new Date().toISOString() })
      .or('draft_settings.not.is.null,draft_enabled.not.is.null,draft_sort_order.not.is.null,draft_deleted.not.is.null');
    if (error) return NextResponse.json({ error: 'Could not discard draft.' }, { status: 500 });
    await logAudit(sb, { actor: session.user.email ?? null, role: session.role, action: 'discard', resource: 'homepage' });
    return NextResponse.json({ ok: true });
  }

  if (action === 'draft') {
    const ids = sections.map((s) => s.id).filter((v): v is string => !!v);
    const rows = sections.map((s) => ({
      id: s.id,
      key: s.key,
      name: s.name ?? s.key,
      draft_enabled: !!s.enabled,
      draft_sort_order: s.sort_order,
      draft_settings: s.settings ?? {},
      draft_deleted: null,
    }));
    const { error } = await sb.from('homepage_sections').upsert(rows, { onConflict: 'id' });
    if (error) return NextResponse.json({ error: 'Could not save draft.' }, { status: 500 });
    // Stage deletion of rows removed in the editor. Live content is untouched.
    const gone = sb.from('homepage_sections').update({ draft_deleted: true, updated_at: new Date().toISOString() });
    const { error: delErr } = ids.length
      ? await gone.not('id', 'in', `(${ids.join(',')})`)
      : await gone.not('id', 'is', null);
    if (delErr) return NextResponse.json({ error: 'Could not save draft.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // action === 'publish' — copy working config over live, clear drafts, and
  // delete rows removed in the editor.
  const author = session.user.email ?? null;
  const base = typeof body.baseUpdatedAt === 'string' && body.baseUpdatedAt ? body.baseUpdatedAt : null;
  if (base) {
    // Optimistic locking: refuse to publish over someone else's publish.
    const { data: touched } = await sb.from('homepage_sections').select('id').gt('updated_at', base).limit(1);
    if (touched?.length) {
      return NextResponse.json({ error: 'Someone else published changes — reload the latest before publishing.', conflict: true }, { status: 409 });
    }
  }
  const ids = sections.map((s) => s.id).filter((v): v is string => !!v);
  const rows = sections.map((s) => ({
    id: s.id,
    key: s.key,
    name: s.name ?? s.key,
    enabled: !!s.enabled,
    sort_order: s.sort_order,
    settings: s.settings ?? {},
    draft_enabled: null,
    draft_sort_order: null,
    draft_settings: null,
    draft_deleted: null,
  }));
  const { error } = await sb.from('homepage_sections').upsert(rows, { onConflict: 'id' });
  if (error) return NextResponse.json({ error: 'Could not publish.' }, { status: 500 });
  const gone = sb.from('homepage_sections').delete();
  const { error: delErr } = ids.length
    ? await gone.not('id', 'in', `(${ids.join(',')})`)
    : await gone.not('id', 'is', null);
  if (delErr) return NextResponse.json({ error: 'Could not publish.' }, { status: 500 });
  const publishedAt = new Date().toISOString();
  await recordVersion(
    sb,
    'homepage',
    { sections: rows.map((r) => ({ key: r.key, name: r.name, enabled: r.enabled, sort_order: r.sort_order, settings: r.settings })) },
    author,
    'Published homepage'
  );
  await logAudit(sb, { actor: author, role: session.role, action: 'publish', resource: 'homepage', summary: `${rows.length} sections` });
  return NextResponse.json({ ok: true, updatedAt: publishedAt });
}