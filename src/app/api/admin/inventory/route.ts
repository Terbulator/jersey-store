import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';

export async function PATCH(req: NextRequest) {
  await requireAdmin();
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.id) return NextResponse.json({ error: 'Missing variant id.' }, { status: 400 });

  const allowed = new Set(['stock', 'low_stock_threshold', 'sku', 'price']);
  const updates: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (allowed.has(k) && v !== undefined) {
      updates[k] = typeof v === 'number' ? v : String(v);
    }
  }
  if (!Object.keys(updates).length) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });

  const sb = await adminDataClient();
  const { error } = await sb
    .from('product_variants')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', body.id);
  if (error) return NextResponse.json({ error: 'Could not save inventory.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}