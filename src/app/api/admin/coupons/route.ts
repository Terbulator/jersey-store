import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDataClient } from '@/lib/admin-session';
import { authorize } from '@/lib/api-guard';
import { checkMutation } from '@/lib/security';
import { logAudit } from '@/lib/audit';

// Coupon creation. The stored row is the single source of truth for pricing: the
// checkout endpoint re-reads it and calls redeem_coupon() under a row lock, so
// nothing a client sends at checkout can change the discount.

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(30)
    .regex(/^[A-Za-z0-9_-]+$/, 'Code may contain letters, numbers, hyphen and underscore only.')
    .transform((s) => s.toUpperCase()),
  type: z.enum(['percent', 'fixed']).default('percent'),
  // percent is capped at 100 and fixed at a sane ceiling so a typo cannot mint an
  // order for negative money.
  value: z.coerce.number().min(0.01).max(10_000_000),
  min_spend: z.coerce.number().min(0).max(10_000_000).nullable().optional(),
  max_discount: z.coerce.number().min(0).max(10_000_000).nullable().optional(),
  max_uses: z.coerce.number().int().min(1).max(10_000_000).nullable().optional(),
  valid_from: z.string().datetime().nullable().optional(),
  valid_until: z.string().datetime().nullable().optional(),
  active: z.boolean().default(true),
}).superRefine((data, ctx) => {
  if (data.type === 'percent' && data.value > 100) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['value'], message: 'Percent must be 100 or less.' });
  }
  if (data.valid_from && data.valid_until && new Date(data.valid_until) <= new Date(data.valid_from)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['valid_until'], message: 'End date must be after the start date.' });
  }
});

export async function POST(req: NextRequest) {
  const guard = await authorize({ permission: 'coupons:write' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req);
  if (blocked) return blocked;

  const parsed = couponSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid coupon details.', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const sb = await adminDataClient();
  const { error } = await sb.from('coupons').insert({
    code: parsed.data.code,
    type: parsed.data.type,
    value: parsed.data.value,
    min_spend: parsed.data.min_spend ?? null,
    max_discount: parsed.data.max_discount ?? null,
    max_uses: parsed.data.max_uses ?? null,
    valid_from: parsed.data.valid_from ?? null,
    valid_until: parsed.data.valid_until ?? null,
    active: parsed.data.active,
    // Start the counter server-side; a client cannot preset used_count.
    used_count: 0,
  });
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That code already exists.' }, { status: 409 });
    return NextResponse.json({ error: 'Could not create coupon.' }, { status: 500 });
  }
  await logAudit(sb, {
    actor: guard.actor.user.email ?? null,
    role: guard.actor.role,
    action: 'create',
    resource: 'coupons',
    summary: parsed.data.code,
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}