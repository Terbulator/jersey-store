import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { checkOrigin, checkRateLimit } from '@/lib/security';
import { logAudit } from '@/lib/audit';

const couponSchema = z.object({
  code: z.string().trim().min(2).max(30).transform((s) => s.toUpperCase()),
  type: z.enum(['percent', 'fixed']).default('percent'),
  value: z.coerce.number().min(1),
  min_spend: z.coerce.number().min(0).nullable().optional(),
  max_discount: z.coerce.number().min(0).nullable().optional(),
  max_uses: z.coerce.number().int().min(1).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
  if (blocked) return blocked;
  const parsed = couponSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid coupon details.', issues: parsed.error.flatten() }, { status: 400 });
  }
  const sb = await adminDataClient();
  const { error } = await sb.from('coupons').insert({
    ...parsed.data,
    min_spend: parsed.data.min_spend ?? null,
    max_discount: parsed.data.max_discount ?? null,
    max_uses: parsed.data.max_uses ?? null,
  });
  if (error) return NextResponse.json({ error: 'Could not create coupon.' }, { status: 500 });
  await logAudit(sb, { actor: session.user.email ?? null, role: session.role, action: 'create', resource: 'coupons', summary: parsed.data.code });
  return NextResponse.json({ ok: true }, { status: 201 });
}