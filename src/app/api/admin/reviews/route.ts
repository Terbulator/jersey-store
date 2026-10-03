import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDataClient } from '@/lib/admin-session';
import { authorize } from '@/lib/api-guard';
import { checkMutation } from '@/lib/security';

const UUID = z.string().uuid();

const moderationSchema = z
  .object({
    id: UUID,
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    featured: z.boolean().optional(),
  })
  .refine((v) => v.status !== undefined || v.featured !== undefined, {
    message: 'Nothing to update.',
  });

const deleteSchema = z.object({ id: UUID });

export async function PATCH(req: NextRequest) {
  const guard = await authorize({ permission: 'reviews:write' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req);
  if (blocked) return blocked;

  const parsed = moderationSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid review update.' }, { status: 400 });
  }

  const { id, ...rest } = parsed.data;
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString(), ...rest };

  const sb = await adminDataClient();
  const { error } = await sb.from('reviews').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: 'Could not update review.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const guard = await authorize({ permission: 'reviews:delete' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req, 'expensive');
  if (blocked) return blocked;

  const parsed = deleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid review id.' }, { status: 400 });

  const sb = await adminDataClient();
  const { error } = await sb.from('reviews').delete().eq('id', parsed.data.id);
  if (error) return NextResponse.json({ error: 'Could not delete review.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}