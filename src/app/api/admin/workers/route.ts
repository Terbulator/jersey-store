import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { getAdminUser } from '@/lib/admin-guard';

export async function GET(req: NextRequest) {
  const { error } = await getAdminUser();
  if (error) return error;

  const search = req.nextUrl.searchParams.get('search') ?? '';

  const where: Prisma.WorkerWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {};

  const workers = await prisma.worker.findMany({
    where,
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ workers });
}
