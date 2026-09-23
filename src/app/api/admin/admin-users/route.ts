import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';

const ROLES = ['ADMIN', 'OWNER', 'WORKER'];

export async function POST(req: NextRequest) {
  await requireAdmin();
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  const { email, role } = body;
  if (!email || !ROLES.includes(String(role))) {
    return NextResponse.json({ error: 'Provide an email and a valid role.' }, { status: 400 });
  }
  const sb = await adminDataClient();
  const { data: users, error } = await sb
    .schema('auth')
    .from('users')
    .select('id')
    .eq('email', String(email).toLowerCase())
    .limit(1);
  if (error || !users?.length) {
    return NextResponse.json({ error: 'No Supabase user with that email.' }, { status: 404 });
  }
  const { error: insertError } = await sb
    .from('admin_users')
    .insert({ user_id: users[0].id, role: String(role) });
  if (insertError) return NextResponse.json({ error: 'This user may already be an admin.' }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  await requireAdmin();
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  const { id, role } = body;
  if (!id || !ROLES.includes(String(role))) {
    return NextResponse.json({ error: 'Provide an id and a valid role.' }, { status: 400 });
  }
  const sb = await adminDataClient();
  const { error } = await sb.from('admin_users').update({ role: String(role) }).eq('id', String(id));
  if (error) return NextResponse.json({ error: 'Could not update.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  await requireAdmin();
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  const sb = await adminDataClient();
  const { error } = await sb.from('admin_users').delete().eq('id', String(id));
  if (error) return NextResponse.json({ error: 'Could not remove.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}