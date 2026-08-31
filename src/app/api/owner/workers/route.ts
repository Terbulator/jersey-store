import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getOwnerUser } from '@/lib/owner-guard';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const guarded = await getOwnerUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const search = req.nextUrl.searchParams.get('search') ?? '';
  const where: Prisma.WorkerWhereInput = { ownerId: user.id };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
      { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
    ];
  }

  const workers = await prisma.worker.findMany({
    where,
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const mapped = workers.map((w) => ({
    id: w.id,
    name: w.name,
    email: w.email,
    phone: w.phone,
    status: w.status,
    taskCount: w._count.tasks,
    createdAt: w.createdAt,
  }));

  return NextResponse.json({ workers: mapped });
}

export async function POST(req: NextRequest) {
  const guarded = await getOwnerUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const body = await req.json();
  const { name, email, phone } = body;
  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }

  try {
    // link to existing user by email or create a minimal account
    let userId = (await prisma.user.findUnique({ where: { email } }))?.id;
    if (!userId) {
      const created = await prisma.user.create({ data: { email, name } });
      userId = created.id;
    }
    // promote that user to WORKER
    await prisma.user.update({ where: { id: userId }, data: { role: 'WORKER' } });

    const worker = await prisma.worker.create({
      data: { ownerId: user.id, userId, name, email, phone: phone ?? null },
    });

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'worker.create',
      resource: 'worker',
      resourceId: worker.id,
      newValues: { name, email },
    });

    return NextResponse.json({ worker }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to add worker' }, { status: 500 });
  }
}
