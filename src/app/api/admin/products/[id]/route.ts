import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, error } = await sb.from('products').select('*').eq('id', params.id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  return NextResponse.json({ product: data });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin();
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });

  const allowed = new Set([
    'slug', 'name', 'category', 'edition', 'team', 'season', 'badge', 'price', 'compare_price',
    'image', 'image_alt', 'description', 'fit', 'material', 'care', 'featured', 'published',
  ]);
  const updates: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (allowed.has(k)) updates[k] = v;
  }
  if (!Object.keys(updates).length) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });

  const sb = await adminDataClient();
  const { error } = await sb.from('products').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', params.id);
  if (error) return NextResponse.json({ error: 'Could not save product.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin();
  const sb = await adminDataClient();
  const { error } = await sb.from('products').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: 'Could not delete product.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}