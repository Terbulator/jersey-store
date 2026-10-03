import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDataClient } from '@/lib/admin-session';
import { authorize } from '@/lib/api-guard';
import { checkMutation } from '@/lib/security';
import { logAudit } from '@/lib/audit';

const announcementSchema = z.object({
  id: z.string().uuid().optional(),
  text: z.string().trim().min(1).max(500).optional(),
  active: z.boolean().optional(),
  sort_order: z.number().int().min(-10_000).max(10_000).optional(),
});

const createSchema = announcementSchema.required({ text: true });

const parse = async (req: NextRequest) => req.json().catch(() => null);

export async function POST(req: NextRequest) {
  const guard = await authorize({ permission: 'content:write' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req);
  if (blocked) return blocked;

  const parsed = createSchema.safeParse(await parse(req));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid announcement.' }, { status: 400 });

  const sb = await adminDataClient();
  const { error } = await sb.from('announcements').insert({
    text: parsed.data.text,
    active: parsed.data.active ?? true,
    sort_order: parsed.data.sort_order ?? 100,
  });
  if (error) return NextResponse.json({ error: 'Could not add.' }, { status: 500 });
  await logAudit(sb, { actor: guard.actor.user.email ?? null, role: guard.actor.role, action: 'create', resource: 'announcements', summary: parsed.data.text.slice(0, 120) });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const guard = await authorize({ permission: 'content:write' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req);
  if (blocked) return blocked;

  const parsed = announcementSchema.safeParse(await parse(req));
  if (!parsed.success || !parsed.data.id) {
    return NextResponse.json({ error: 'Missing or invalid id.' }, { status: 400 });
  }
  const { id, ...rest } = parsed.data;
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (rest.text !== undefined) updates.text = rest.text;
  if (rest.active !== undefined) updates.active = rest.active;
  if (rest.sort_order !== undefined) updates.sort_order = rest.sort_order;

  const sb = await adminDataClient();
  const { error } = await sb.from('announcements').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: 'Could not save.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const guard = await authorize({ permission: 'content:delete' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req, 'expensive');
  if (blocked) return blocked;

  const parsed = z.object({ id: z.string().uuid() }).safeParse(await parse(req));
  if (!parsed.success) return NextResponse.json({ error: 'Missing or invalid id.' }, { status: 400 });

  const sb = await adminDataClient();
  const { error } = await sb.from('announcements').delete().eq('id', parsed.data.id);
  if (error) return NextResponse.json({ error: 'Could not delete.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}