import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { variantSchema, variantUpdateSchema } from '@/lib/product-schemas';
import { checkOrigin, checkRateLimit } from '@/lib/security';
import { logAudit } from '@/lib/audit';

// Product variants (size/color/SKU/price/stock per product).

export async function GET(req: NextRequest) {
  await requireAdmin();
  const productId = new URL(req.url).searchParams.get('product_id');
  if (!productId) return NextResponse.json({ error: 'Missing product_id.' }, { status: 400 });
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('product_variants')
    .select('id, size, color, sku, price, stock, low_stock_threshold')
    .eq('product_id', productId)
    .order('size');
  if (error) return NextResponse.json({ error: 'Could not load variants.' }, { status: 500 });
  return NextResponse.json({ variants: data ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
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
  await logAudit(sb, { actor: session.user.email ?? null, role: session.role, action: 'create', resource: 'variants', resourceId: data.id, summary: String(parsed.data.size) });
  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
  if (blocked) return blocked;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.id || typeof body.id !== 'string') return NextResponse.json({ error: 'Missing variant id.' }, { status: 400 });
  const { id, ...rest } = body;
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
    .eq('id', id);
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That SKU is already used.' }, { status: 409 });
    return NextResponse.json({ error: 'Could not save variant.' }, { status: 500 });
  }
  await logAudit(sb, { actor: session.user.email ?? null, role: session.role, action: 'update', resource: 'variants', resourceId: id, summary: Object.keys(parsed.data).join(', ') });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req, 'expensive');
  if (blocked) return blocked;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.id) return NextResponse.json({ error: 'Missing variant id.' }, { status: 400 });
  const sb = await adminDataClient();
  const { error } = await sb.from('product_variants').delete().eq('id', body.id);
  if (error) return NextResponse.json({ error: 'Could not delete variant.' }, { status: 500 });
  await logAudit(sb, { actor: session.user.email ?? null, role: session.role, action: 'delete', resource: 'variants', resourceId: String(body.id) });
  return NextResponse.json({ ok: true });
}
