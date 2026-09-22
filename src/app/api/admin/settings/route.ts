import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';

export async function GET() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, error } = await sb.from('site_settings').select('key, value');
  if (error) return NextResponse.json({ error: 'Could not load settings.' }, { status: 500 });
  const settings: Record<string, unknown> = {};
  for (const row of data ?? []) settings[row.key] = row.value;
  return NextResponse.json({ settings });
}

const ALLOWED_KEYS = ['shipping', 'contact', 'site'];

export async function PATCH(req: NextRequest) {
  await requireAdmin();
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid settings.' }, { status: 400 });
  }
  const sb = await adminDataClient();
  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_KEYS.includes(key)) continue;
    const { error } = await sb
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) return NextResponse.json({ error: 'Could not save settings.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}