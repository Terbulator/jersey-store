import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDataClient } from '@/lib/admin-session';
import { authorize } from '@/lib/api-guard';
import { variantSchema, variantUpdateSchema } from '@/lib/product-schemas';
import { checkMutation } from '@/lib/security';
import { logAudit } from '@/lib/audit';

// Product variants (size/color/SKU/price/stock per product).
//
// Reads are open to any staff (`products:read`); creating or editing a variant also
// changes sellable pricing, so it requires `products:write` (OWNER/ADMIN). Workers
// adjust stock levels through /api/admin/inventory instead.

const uuid = z.string().uuid('Invalid id.');

export async function GET(req: NextRequest) {
  const guard = await authorize({ permission: 'products:read' });
  if (!guard.ok) return guard.response;
  const productId = new URL(req.url).searchParams.get('product_id');
  const parsedId = uuid.safeParse(productId);
  if (!parsedId.success) return NextResponse.json({ error: 'Invalid product_id.' }, { status: 400 });

  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('product_variants')
    .select('id, size, color, sku, price, stock, low_stock_threshold')
    .eq('product_id', parsedId.data)
    .order('size');
  if (error) return NextResponse.json({ error: 'Could not load variants.' }, { status: 500 });
  return NextResponse.json({ variants: data ?? [] });
}

export async function POST(req: NextRequest) {
  const guard = await authorize({ permission: 'products:write' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req);
  if (blocked) return blocked;

  const parsed = variantSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue?.path.join('.') || 'variant'}: ${issue?.message}` }, { status: 400 });
  }

  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('product_variants')
    .insert({ ...parsed.data, stock: parsed.data.stock ?? 0, updated_at: new Date().toISOString() })
    .select('id')
    .single();
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That SKU is already used.' }, { status: 409 });
    return NextResponse.json({ error: 'Could not create variant.' }, { status: 500 });
  }
  await logAudit(sb, {
    actor: guard.actor.user.email ?? null,
    role: guard.actor.role,
    action: 'create',
    resource: 'variants',
    resourceId: data.id,
    summary: String(parsed.data.size),
  });
  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const guard = await authorize({ permission: 'products:write' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req);
  if (blocked) return blocked;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const id = uuid.safeParse(body?.id);
  if (!id.success) return NextResponse.json({ error: 'Invalid variant id.' }, { status: 400 });

  const { id: _ignored, ...rest } = body as Record<string, unknown>;
  const parsed = variantUpdateSchema.safeParse(rest);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue?.path.join('.') || 'variant'}: ${issue?.message}` }, { status: 400 });
  }
  if (!Object.keys(parsed.data).length) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });

  const sb = await adminDataClient();
  const { error } = await sb
    .from('product_variants')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id.data);
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That SKU is already used.' }, { status: 409 });
    return NextResponse.json({ error: 'Could not save variant.' }, { status: 500 });
  }
  await logAudit(sb, {
    actor: guard.actor.user.email ?? null,
    role: guard.actor.role,
    action: 'update',
    resource: 'variants',
    resourceId: id.data,
    summary: Object.keys(parsed.data).join(', '),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const guard = await authorize({ permission: 'products:delete' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req, 'expensive');
  if (blocked) return blocked;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const id = uuid.safeParse(body?.id);
  if (!id.success) return NextResponse.json({ error: 'Invalid variant id.' }, { status: 400 });

  const sb = await adminDataClient();
  const { error } = await sb.from('product_variants').delete().eq('id', id.data);
  if (error) return NextResponse.json({ error: 'Could not delete variant.' }, { status: 500 });
  await logAudit(sb, {
    actor: guard.actor.user.email ?? null,
    role: guard.actor.role,
    action: 'delete',
    resource: 'variants',
    resourceId: id.data,
  });
  return NextResponse.json({ ok: true });
}