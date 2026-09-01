import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin-guard';
import { checkPermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const couponSchema = z.object({
  code: z.string().min(1).max(50),
  description: z.string().optional(),
  percentOff: z.number().int().min(1).max(100),
  maxDiscount: z.number().positive().optional(),
  minSubtotal: z.number().nonnegative().default(0),
  maxUses: z.number().int().positive().optional(),
  active: z.boolean().optional(),
  expiresAt: z.string().optional(),
});

export async function GET() {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  const mapped = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    description: c.description,
    percentOff: c.percentOff,
    maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
    minSubtotal: Number(c.minSubtotal),
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    active: c.active,
    expiresAt: c.expiresAt,
  }));

  return NextResponse.json({ coupons: mapped });
}

export async function POST(req: NextRequest) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const body = await req.json();
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid coupon' }, { status: 400 });
  }

  const d = parsed.data;
  const existing = await prisma.coupon.findUnique({ where: { code: d.code.trim() } });
  if (existing) return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });

  const capSetting = await prisma.setting.findUnique({ where: { key: 'couponMaxPercent' } });
  const cap = capSetting ? Number(capSetting.value) : 100;
  if (d.percentOff > cap && !(await checkPermission(user.id, user.role, 'coupons.above_cap'))) {
    return NextResponse.json({ error: `Allowed max discount is ${cap}%. Contact the Owner for a higher cap.` }, { status: 403 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: d.code.trim().toUpperCase(),
      description: d.description ?? null,
      percentOff: d.percentOff,
      maxDiscount: d.maxDiscount ?? null,
      minSubtotal: d.minSubtotal,
      maxUses: d.maxUses ?? null,
      active: d.active ?? true,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
    },
  });

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'coupon.create',
    resource: 'coupon',
    resourceId: coupon.id,
    newValues: { code: coupon.code, percentOff: coupon.percentOff },
  });

  return NextResponse.json({ coupon }, { status: 201 });
}
