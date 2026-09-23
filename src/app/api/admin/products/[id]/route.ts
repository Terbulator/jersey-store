import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { productUpdateSchema } from '@/lib/product-schemas';
import { checkOrigin, checkRateLimit } from '@/lib/security';
import { logAudit } from '@/lib/audit';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin();
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
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
  if (blocked) return blocked;
  const body = await req.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body ?? {});
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue?.path.join('.') || 'product'}: ${issue?.message}` }, { status: 400 });
  }
  if (!Object.keys(parsed.data).length) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });

  const updates = { ...parsed.data } as Record<string, unknown>;
  if (updates.image === '') updates.image = null;

  const sb = await adminDataClient();
  const { error } = await sb.from('products').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', params.id);
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That slug is already used.' }, { status: 409 });
    return NextResponse.json({ error: 'Could not save product.' }, { status: 500 });
  }
  await logAudit(sb, { actor: session.user.email ?? null, role: session.role, action: 'update', resource: 'products', resourceId: params.id, summary: Object.keys(parsed.data).join(', ') });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  const sb = await adminDataClient();
  const { error } = await sb.from('products').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: 'Could not delete product.' }, { status: 500 });
  await logAudit(sb, { actor: session.user.email ?? null, role: session.role, action: 'delete', resource: 'products', resourceId: params.id });
  return NextResponse.json({ ok: true });
}
