import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin-guard';
import { logAudit } from '@/lib/audit';
import { Prisma, Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  const search = req.nextUrl.searchParams.get('search') ?? '';
  const role = req.nextUrl.searchParams.get('role') ?? '';
  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(req.nextUrl.searchParams.get('size') ?? '20', 10);

  const where: Prisma.UserWhereInput = {};
  if (role && Object.values(Role).includes(role as Role)) where.role = role as Role;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, email: true, name: true, role: true, createdAt: true,
        vendor: { select: { storeName: true, status: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, pageSize });
}

export async function PATCH(req: NextRequest) {
  const guarded = await getAdminUser();
  if (!guarded.ok) return guarded.error;

  const body = await req.json();
  const { userId, role } = body;

  if (!userId || !role || !Object.values(Role).includes(role)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  await logAudit({
    actorId: guarded.user.id,
    actorEmail: guarded.user.email,
    actorRole: guarded.user.role,
    action: 'user.update_role',
    resource: 'user',
    resourceId: userId,
    oldValues: { role: existing.role },
    newValues: { role: updated.role },
  });

  return NextResponse.json({ ok: true });
}
