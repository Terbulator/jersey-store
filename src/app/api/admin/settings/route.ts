import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { getAdminUser } from '@/lib/admin-guard';
import { logAudit } from '@/lib/audit';
export const dynamic = 'force-dynamic';

export async function GET() {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  const settings = await prisma.setting.findMany({ orderBy: { key: 'asc' } });
  const mapped: Record<string, unknown> = {};
  for (const s of settings) mapped[s.key] = s.value;

  return NextResponse.json({ settings: mapped });
}

export async function PATCH(req: NextRequest) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  const body: Record<string, unknown> = await req.json();
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const previous: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body)) {
    const existing = await prisma.setting.findUnique({ where: { key } });
    if (existing) previous[key] = existing.value;
    await prisma.setting.upsert({
      where: { key },
      update: { value: value as Prisma.InputJsonValue },
      create: { key, value: value as Prisma.InputJsonValue },
    });
  }

  await logAudit({
    actorId: guarded.user.id,
    actorEmail: guarded.user.email,
    actorRole: guarded.user.role,
    action: 'settings.update',
    resource: 'setting',
    oldValues: previous as Prisma.InputJsonValue,
    newValues: body as Prisma.InputJsonValue,
  });

  return NextResponse.json({ ok: true });
}
