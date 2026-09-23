import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { listVersions, getVersionSnapshot, recordVersion, type VersionScope } from '@/lib/versions';
import { checkOrigin, checkRateLimit } from '@/lib/security';
import { logAudit } from '@/lib/audit';

const SCOPES: VersionScope[] = ['homepage', 'theme', 'header', 'footer', 'templates'];

// Version history list. ?scope=homepage returns latest first with total for
// V-numbering; ?id=… includes the snapshot for preview.
export async function GET(req: NextRequest) {
  await requireAdmin();
  const params = new URL(req.url).searchParams;
  const scope = params.get('scope') ?? 'homepage';
  if (!SCOPES.includes(scope as VersionScope)) return NextResponse.json({ error: 'Unknown scope.' }, { status: 400 });
  const sb = await adminDataClient();
  try {
    const { versions, total } = await listVersions(sb, scope as VersionScope);
    if (params.get('id')) {
      const v = await getVersionSnapshot(sb, params.get('id')!);
      return NextResponse.json({ versions, total, snapshot: v.snapshot, snapshotScope: v.scope });
    }
    return NextResponse.json({ versions, total });
  } catch {
    return NextResponse.json({ error: 'Could not load versions.' }, { status: 500 });
  }
}

// Restore a version: snapshots current live state first (so the restore
// itself is undoable), then applies the version as a publish.
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req, 'expensive');
  if (blocked) return blocked;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.id || typeof body.id !== 'string') return NextResponse.json({ error: 'Missing version id.' }, { status: 400 });
  const sb = await adminDataClient();
  const author = session.user.email ?? null;

  let version: { scope: string; snapshot: unknown };
  try {
    version = await getVersionSnapshot(sb, body.id);
  } catch {
    return NextResponse.json({ error: 'Version not found.' }, { status: 404 });
  }

  if (version.scope === 'homepage') {
    const snap = version.snapshot as { sections?: { key: string; name: string; enabled: boolean; sort_order: number; settings: Record<string, unknown> | null }[] };
    if (!snap || !Array.isArray(snap.sections)) return NextResponse.json({ error: 'Invalid version snapshot.' }, { status: 400 });
    const { data: live } = await sb.from('homepage_sections').select('key, name, enabled, sort_order, settings');
    await recordVersion(sb, 'homepage', { sections: live ?? [] }, author, 'Before restore');
    const now = new Date().toISOString();
    // Apply by key: wipe live rows for these keys, insert the snapshot.
    // (Post-instances-migration, duplicate keys are re-created as fresh rows.)
    const keys = [...new Set(snap.sections.map((s) => s.key))];
    if (keys.length) await sb.from('homepage_sections').delete().in('key', keys);
    const { error } = await sb.from('homepage_sections').insert(
      snap.sections.map((s, i) => ({
        key: s.key,
        name: s.name ?? s.key,
        enabled: !!s.enabled,
        sort_order: Number.isFinite(Number(s.sort_order)) ? Number(s.sort_order) : i,
        settings: s.settings ?? {},
        updated_at: now,
      }))
    );
    if (error) return NextResponse.json({ error: 'Could not restore version.' }, { status: 500 });
    await recordVersion(sb, 'homepage', version.snapshot, author, 'Restored version');
    await logAudit(sb, { actor: author, role: session.role, action: 'restore', resource: 'homepage', resourceId: typeof body.id === 'string' ? body.id : null });
    return NextResponse.json({ ok: true });
  }

  // Settings scopes: snapshot is the raw key value.
  if (SCOPES.includes(version.scope as VersionScope)) {
    const { data: current } = await sb.from('site_settings').select('value').eq('key', version.scope).maybeSingle();
    await recordVersion(sb, version.scope as VersionScope, (current as { value?: unknown } | null)?.value ?? {}, author, 'Before restore');
    const { error } = await sb
      .from('site_settings')
      .upsert({ key: version.scope, value: version.snapshot ?? {}, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) return NextResponse.json({ error: 'Could not restore version.' }, { status: 500 });
    await recordVersion(sb, version.scope as VersionScope, version.snapshot ?? {}, author, 'Restored version');
    await logAudit(sb, { actor: author, role: session.role, action: 'restore', resource: version.scope, resourceId: typeof body.id === 'string' ? body.id : null });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown scope.' }, { status: 400 });
}
