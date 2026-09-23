import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { productSchema } from '@/lib/product-schemas';
import { checkOrigin, checkRateLimit } from '@/lib/security';
import { logAudit } from '@/lib/audit';

// Category/edition options for the product forms.
export async function GET() {
  await requireAdmin();
  const sb = await adminDataClient();
  const [{ data: categories }, { data: editions }] = await Promise.all([
    sb.from('categories').select('slug, name').order('name'),
    sb.from('editions').select('slug, name').order('name'),
  ]);
  return NextResponse.json({ categories: categories ?? [], editions: editions ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
  if (blocked) return blocked;
  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue?.path.join('.') || 'product'}: ${issue?.message}` }, { status: 400 });
  }
  const sb = await adminDataClient();
  const { data: dup } = await sb.from('products').select('id').eq('slug', parsed.data.slug).maybeSingle();
  if (dup) return NextResponse.json({ error: 'That slug is already used.' }, { status: 409 });
  const { data, error } = await sb.from('products').insert({
    ...parsed.data,
    compare_price: parsed.data.compare_price ?? null,
    image: parsed.data.image || null,
  }).select('id').single();
  if (error) return NextResponse.json({ error: 'Could not create product.' }, { status: 500 });
  await logAudit(sb, { actor: session.user.email ?? null, role: session.role, action: 'create', resource: 'products', resourceId: data.id, summary: parsed.data.slug });
  return NextResponse.json({ id: data.id }, { status: 201 });
}