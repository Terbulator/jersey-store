import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDataClient } from '@/lib/admin-session';
import { authorize } from '@/lib/api-guard';
import { checkMutation } from '@/lib/security';
import { logAudit } from '@/lib/audit';

// Inventory adjustments: the one staff operation WORKER is explicitly meant to perform.
// Prices are clamped at 0 so a crafted payload cannot write a negative unit price.

const inventorySchema = z
  .object({
    id: z.string().uuid('Invalid variant id.'),
    stock: z.coerce.number().int().min(0).max(1_000_000).optional(),
    low_stock_threshold: z.coerce.number().int().min(0).max(1_000_000).optional(),
    sku: z.string().trim().max(80).nullable().optional(),
    price: z.coerce.number().min(0).max(10_000_000).nullable().optional(),
  })
  .strict();

export async function PATCH(req: NextRequest) {
  const guard = await authorize({ permission: 'inventory:write' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req);
  if (blocked) return blocked;

  const parsed = inventorySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue?.path.join('.') || 'inventory'}: ${issue?.message}` }, { status: 400 });
  }
  const { id, ...updates } = parsed.data;
  if (!Object.keys(updates).length) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });

  const sb = await adminDataClient();
  const { error } = await sb
    .from('product_variants')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return NextResponse.json({ error: 'Could not save inventory.' }, { status: 500 });
  await logAudit(sb, {
    actor: guard.actor.user.email ?? null,
    role: guard.actor.role,
    action: 'stock',
    resource: 'inventory',
    resourceId: id,
    summary: Object.keys(updates).join(', '),
  });
  return NextResponse.json({ ok: true });
}