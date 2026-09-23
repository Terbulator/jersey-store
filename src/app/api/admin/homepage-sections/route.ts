import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';

export async function GET(req: NextRequest) {
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('homepage_sections')
    .select('id, key, name, enabled, sort_order, settings')
    .order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: 'Could not load sections.' }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function PATCH(req: NextRequest) {
  await requireAdmin();
  const body = await req.json().catch(() => null);
  if (!body?.id || typeof body.id !== 'string') return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  const sb = await adminDataClient();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.enabled !== undefined) updates.enabled = !!body.enabled;
  if (body.sort_order !== undefined) updates.sort_order = Number(body.sort_order);
  if (body.settings !== undefined) {
    try { updates.settings = typeof body.settings === 'string' ? JSON.parse(body.settings) : body.settings; }
    catch { return NextResponse.json({ error: 'Invalid settings JSON.' }, { status: 400 }); }
  }
  const { error } = await sb.from('homepage_sections').update(updates).eq('id', body.id);
  if (error) return NextResponse.json({ error: 'Could not save section.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
