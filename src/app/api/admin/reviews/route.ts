import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { checkOrigin, checkRateLimit } from '@/lib/security';

const VALID_STATUSES = ['pending', 'approved', 'rejected'];

export async function PATCH(req: NextRequest) {
  await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
  if (blocked) return blocked;
  const { id, status, featured } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  const sb = await adminDataClient();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    updates.status = status;
  }
  if (featured !== undefined) updates.featured = !!featured;
  const { error } = await sb.from('reviews').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: 'Could not update review.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req, 'expensive');
  if (blocked) return blocked;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  const sb = await adminDataClient();
  const { error } = await sb.from('reviews').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Could not delete review.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}