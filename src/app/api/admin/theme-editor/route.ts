import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';

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
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('homepage_sections')
    .select('id, key, name, enabled, sort_order, settings, draft_enabled, draft_sort_order, draft_settings')
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
  return NextResponse.json({ items });
}

interface ClientSection {
  id?: string | null;
  key: string;
  name: string;
  enabled: boolean;
  sort_order: number;
  settings: Record<string, unknown> | null;
}

// Save the working config as draft (no changes to live/published state).
export async function POST(req: NextRequest) {
  await requireAdmin();
  const body = await req.json().catch(() => null);
  if (!body || !['draft', 'publish', 'discard'].includes(body.action)) {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  }

  const sb = await adminDataClient();
  const action = body.action as 'draft' | 'publish' | 'discard';

  const sections: ClientSection[] = Array.isArray(body.sections) ? body.sections : [];
  for (const s of sections) {
    if (!s.key || typeof s.key !== 'string') return NextResponse.json({ error: 'Missing section key.' }, { status: 400 });
  }

  if (action === 'discard') {
    const { error } = await sb
      .from('homepage_sections')
      .update({ draft_enabled: null, draft_sort_order: null, draft_settings: null, updated_at: new Date().toISOString() })
      .not('draft_settings', 'is', null);
    if (error) return NextResponse.json({ error: 'Could not discard draft.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'draft') {
    const rows = sections.map((s) => ({
      key: s.key,
      name: s.name ?? s.key,
      draft_enabled: !!s.enabled,
      draft_sort_order: Number(s.sort_order),
      draft_settings: s.settings ?? {},
    }));
    const { error } = await sb.from('homepage_sections').upsert(rows, { onConflict: 'key' });
    if (error) return NextResponse.json({ error: 'Could not save draft.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // action === 'publish' — copy working config over live, clear drafts.
  const rows = sections.map((s) => ({
    key: s.key,
    name: s.name ?? s.key,
    enabled: !!s.enabled,
    sort_order: Number(s.sort_order),
    settings: s.settings ?? {},
    draft_enabled: null,
    draft_sort_order: null,
    draft_settings: null,
  }));
  const { error } = await sb.from('homepage_sections').upsert(rows, { onConflict: 'key' });
  if (error) return NextResponse.json({ error: 'Could not publish.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}