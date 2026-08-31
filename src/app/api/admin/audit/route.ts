import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin-guard';

export async function GET(req: NextRequest) {
  const { error } = await getAdminUser();
  if (error) return error;

  const action = req.nextUrl.searchParams.get('action') ?? '';
  const resource = req.nextUrl.searchParams.get('resource') ?? '';
  const search = req.nextUrl.searchParams.get('search') ?? '';
  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(req.nextUrl.searchParams.get('size') ?? '20', 10);

  const where: Record<string, unknown> = {};
  if (action) where.action = action;
  if (resource) where.resource = resource;
  if (search) {
    where.OR = [
      { actorEmail: { contains: search, mode: 'insensitive' } },
      { action: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, pageSize });
}
