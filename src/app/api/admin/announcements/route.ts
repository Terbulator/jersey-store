import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { checkOrigin, checkRateLimit } from '@/lib/security';

export async function POST(req: NextRequest) {
  await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
  if (blocked) return blocked;
  const { text, active, sort_order } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: 'Missing text.' }, { status: 400 });
  const sb = await adminDataClient();
  const { error } = await sb.from('announcements').insert({ text: text.trim(), active: active ?? true, sort_order: sort_order ?? 100 });
  if (error) return NextResponse.json({ error: 'Could not add.' }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
  if (blocked) return blocked;
  const { id, text, active, sort_order } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  const sb = await adminDataClient();
  const updates: Record<string, unknown> = {};
  if (text !== undefined) updates.text = String(text).trim();
  if (active !== undefined) updates.active = !!active;
  if (sort_order !== undefined) updates.sort_order = Number(sort_order);
  const { error } = await sb.from('announcements').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return NextResponse.json({ error: 'Could not save.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req, 'expensive');
  if (blocked) return blocked;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  const sb = await adminDataClient();
  const { error } = await sb.from('announcements').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Could not delete.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}