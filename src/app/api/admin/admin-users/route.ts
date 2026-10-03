import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDataClient } from '@/lib/admin-session';
import { authorize } from '@/lib/api-guard';
import { checkMutation } from '@/lib/security';
import { readJson } from '@/lib/validate';
import { logAudit } from '@/lib/audit';

// Staff administration. Guarded by admin_users:* permissions, which only ADMIN holds
// (OWNER is deliberately excluded from granting or revoking staff access).
//
// Lockout protections kept from the previous implementation: you cannot change or
// remove your own row, and the last remaining ADMIN cannot be demoted or deleted.

const grantSchema = z.object({
  email: z.string().trim().email().max(254),
  role: z.enum(['ADMIN', 'OWNER', 'WORKER']),
});

const roleSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['ADMIN', 'OWNER', 'WORKER']),
});

const idSchema = z.object({ id: z.string().uuid() });

async function lastAdmin(sb: Awaited<ReturnType<typeof adminDataClient>>, exceptId?: string) {
  const { data } = await sb.from('admin_users').select('id').eq('role', 'ADMIN');
  const ids = (data ?? []).map((r) => (r as { id: string }).id).filter((id) => id !== exceptId);
  return ids.length === 0;
}

export async function POST(req: NextRequest) {
  const guard = await authorize({ permission: 'admin_users:write' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req);
  if (blocked) return blocked;

  const parsed = grantSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Provide a valid email and role.' }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();

  const sb = await adminDataClient();
  const { data: users, error } = await sb
    .schema('auth')
    .from('users')
    .select('id')
    .eq('email', email)
    .limit(1);
  if (error || !users?.length) {
    return NextResponse.json({ error: 'No Supabase user with that email.' }, { status: 404 });
  }
  const { error: insertError } = await sb
    .from('admin_users')
    .insert({ user_id: users[0].id, role: parsed.data.role });
  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'This user is already an admin.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Could not grant access.' }, { status: 500 });
  }
  await logAudit(sb, {
    actor: guard.actor.user.email ?? null,
    role: guard.actor.role,
    action: 'grant',
    resource: 'admin_users',
    summary: `${email} -> ${parsed.data.role}`,
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const guard = await authorize({ permission: 'admin_users:write' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req);
  if (blocked) return blocked;

  const parsed = roleSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Provide an id and a valid role.' }, { status: 400 });
  }
  const { id, role } = parsed.data;

  const sb = await adminDataClient();
  const { data: target } = await sb.from('admin_users').select('user_id, role').eq('id', id).maybeSingle();
  if (!target) return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });

  const existing = target as { user_id: string; role: string };
  if (existing.user_id === guard.actor.user.id && role !== existing.role) {
    return NextResponse.json({ error: 'You cannot change your own role.' }, { status: 403 });
  }
  if (role !== 'ADMIN' && existing.role === 'ADMIN' && (await lastAdmin(sb, id))) {
    return NextResponse.json({ error: 'Cannot demote the last admin.' }, { status: 403 });
  }

  const { error } = await sb.from('admin_users').update({ role }).eq('id', id);
  if (error) return NextResponse.json({ error: 'Could not update.' }, { status: 500 });
  await logAudit(sb, {
    actor: guard.actor.user.email ?? null,
    role: guard.actor.role,
    action: 'role_change',
    resource: 'admin_users',
    resourceId: id,
    summary: `-> ${role}`,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const guard = await authorize({ permission: 'admin_users:delete' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req, 'expensive');
  if (blocked) return blocked;

  const parsed = idSchema.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid admin id.' }, { status: 400 });
  const { id } = parsed.data;

  const sb = await adminDataClient();
  const { data: target } = await sb.from('admin_users').select('user_id, role').eq('id', id).maybeSingle();
  if (!target) return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });

  const existing = target as { user_id: string; role: string };
  if (existing.user_id === guard.actor.user.id) {
    return NextResponse.json({ error: 'You cannot remove yourself.' }, { status: 403 });
  }
  if (existing.role === 'ADMIN' && (await lastAdmin(sb, id))) {
    return NextResponse.json({ error: 'Cannot remove the last admin.' }, { status: 403 });
  }

  const { error } = await sb.from('admin_users').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Could not remove.' }, { status: 500 });
  await logAudit(sb, {
    actor: guard.actor.user.email ?? null,
    role: guard.actor.role,
    action: 'revoke',
    resource: 'admin_users',
    resourceId: id,
  });
  return NextResponse.json({ ok: true });
}