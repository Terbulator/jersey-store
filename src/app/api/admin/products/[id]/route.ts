import { NextRequest, NextResponse } from 'next/server';
import { adminDataClient } from '@/lib/admin-session';
import { authorize } from '@/lib/api-guard';
import { productUpdateSchema } from '@/lib/product-schemas';
import { checkMutation } from '@/lib/security';
import { logAudit } from '@/lib/audit';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const badId = () => NextResponse.json({ error: 'Invalid product id.' }, { status: 400 });

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await authorize({ permission: 'products:read' });
  if (!guard.ok) return guard.response;
  if (!UUID.test(params.id)) return badId();

  const sb = await adminDataClient();
  const [{ data, error }, { data: categories }, { data: editions }, { data: variants }] = await Promise.all([
    sb.from('products').select('*').eq('id', params.id).maybeSingle(),
    sb.from('categories').select('slug, name').order('name'),
    sb.from('editions').select('slug, name').order('name'),
    sb.from('product_variants').select('id, size, color, sku, price, stock, low_stock_threshold').eq('product_id', params.id).order('size'),
  ]);
  if (error || !data) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  return NextResponse.json({ product: data, categories: categories ?? [], editions: editions ?? [], variants: variants ?? [] });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await authorize({ permission: 'products:write' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req);
  if (blocked) return blocked;
  if (!UUID.test(params.id)) return badId();

  // The id is a path segment, not a body field: drop it so a crafted body cannot
  // retarget the update at a different row.
  const parsed = productUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue?.path.join('.') || 'product'}: ${issue?.message}` }, { status: 400 });
  }
  if (!Object.keys(parsed.data).length) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });

  const updates = { ...parsed.data } as Record<string, unknown>;
  if (updates.image === '') updates.image = null;
  if (updates.price !== undefined) {
    const price = Number(updates.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: 'price must be zero or greater.' }, { status: 400 });
    }
    updates.price = price;
  }

  const sb = await adminDataClient();
  const { error } = await sb.from('products').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', params.id);
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That slug is already used.' }, { status: 409 });
    return NextResponse.json({ error: 'Could not save product.' }, { status: 500 });
  }
  await logAudit(sb, { actor: guard.actor.user.email ?? null, role: guard.actor.role, action: 'update', resource: 'products', resourceId: params.id, summary: Object.keys(parsed.data).join(', ') });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await authorize({ permission: 'products:delete' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req, 'expensive');
  if (blocked) return blocked;
  if (!UUID.test(params.id)) return badId();

  const sb = await adminDataClient();
  const { error } = await sb.from('products').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: 'Could not delete product.' }, { status: 500 });
  await logAudit(sb, { actor: guard.actor.user.email ?? null, role: guard.actor.role, action: 'delete', resource: 'products', resourceId: params.id });
  return NextResponse.json({ ok: true });
}