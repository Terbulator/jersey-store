import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { checkOrigin, checkRateLimit } from '@/lib/security';
import { logAudit } from '@/lib/audit';

const ROLES = ['ADMIN', 'OWNER', 'WORKER'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function actor(session: { user: { email?: string }; role: string }) {
  return { actor: session.user.email ?? null, role: session.role };
}

async function lastAdmin(sb: Awaited<ReturnType<typeof adminDataClient>>, exceptId?: string) {
  const { data } = await sb.from('admin_users').select('id').eq('role', 'ADMIN');
  const ids = (data ?? []).map((r) => (r as { id: string }).id).filter((id) => id !== exceptId);
  return ids.length === 0;
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
  if (blocked) return blocked;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  const { email, role } = body;
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Provide a valid email.' }, { status: 400 });
  }
  if (!ROLES.includes(String(role))) {
    return NextResponse.json({ error: 'Provide an email and a valid role.' }, { status: 400 });
  }
  const sb = await adminDataClient();
  const { data: users, error } = await sb
    .schema('auth')
    .from('users')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .limit(1);
  if (error || !users?.length) {
    return NextResponse.json({ error: 'No Supabase user with that email.' }, { status: 404 });
  }
  const { error: insertError } = await sb
    .from('admin_users')
    .insert({ user_id: users[0].id, role: String(role) });
  if (insertError) return NextResponse.json({ error: 'This user may already be an admin.' }, { status: 500 });
  await logAudit(sb, { ...actor(session), action: 'grant', resource: 'admin_users', summary: `${email} → ${role}` });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
  if (blocked) return blocked;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  const { id, role } = body;
  if (!id || !ROLES.includes(String(role))) {
    return NextResponse.json({ error: 'Provide an id and a valid role.' }, { status: 400 });
  }
  const sb = await adminDataClient();
  const { data: target } = await sb.from('admin_users').select('user_id, role').eq('id', String(id)).maybeSingle();
  if (!target) return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });
  if ((target as { user_id: string }).user_id === session.user.id && String(role) !== (target as { role: string }).role) {
    return NextResponse.json({ error: 'You cannot change your own role.' }, { status: 403 });
  }
  if (String(role) !== 'ADMIN' && (target as { role: string }).role === 'ADMIN' && (await lastAdmin(sb, String(id)))) {
    return NextResponse.json({ error: 'Cannot demote the last admin.' }, { status: 403 });
  }
  const { error } = await sb.from('admin_users').update({ role: String(role) }).eq('id', String(id));
  if (error) return NextResponse.json({ error: 'Could not update.' }, { status: 500 });
  await logAudit(sb, { ...actor(session), action: 'role_change', resource: 'admin_users', resourceId: String(id), summary: `→ ${role}` });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
  if (blocked) return blocked;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  const sb = await adminDataClient();
  const { data: target } = await sb.from('admin_users').select('user_id, role').eq('id', String(id)).maybeSingle();
  if (!target) return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });
  if ((target as { user_id: string }).user_id === session.user.id) {
    return NextResponse.json({ error: 'You cannot remove yourself.' }, { status: 403 });
  }
  if ((target as { role: string }).role === 'ADMIN' && (await lastAdmin(sb, String(id)))) {
    return NextResponse.json({ error: 'Cannot remove the last admin.' }, { status: 403 });
  }
  const { error } = await sb.from('admin_users').delete().eq('id', String(id));
  if (error) return NextResponse.json({ error: 'Could not remove.' }, { status: 500 });
  await logAudit(sb, { ...actor(session), action: 'revoke', resource: 'admin_users', resourceId: String(id) });
  return NextResponse.json({ ok: true });
}
