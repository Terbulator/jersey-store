import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getOwnerUser } from '@/lib/owner-guard';
import { logAudit } from '@/lib/audit';
import { createAdminClient } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';

const createSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function GET() {
  const guarded = await getOwnerUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const workers = await prisma.worker.findMany({
    where: { ownerId: user.id },
    select: { id: true, name: true, email: true, status: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const mapped = workers.map((w) => ({ id: w.id, name: w.name, email: w.email, role: 'WORKER' as const, createdAt: w.createdAt }));

  return NextResponse.json({ staff: mapped });
}

export async function POST(req: NextRequest) {
  const guarded = await getOwnerUser();
  if (!guarded.ok) return guarded.error;
  const { user } = guarded;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: 'WORKER' },
      user_metadata: { name },
    });
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    const worker = await prisma.user.create({
      data: { name, email, role: 'WORKER' },
    });

    await prisma.worker.create({
      data: { ownerId: user.id, userId: worker.id, name, email },
    });

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'staff.create_worker',
      resource: 'user',
      resourceId: worker.id,
      newValues: { name, email },
    });

    return NextResponse.json({ worker }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create worker' }, { status: 500 });
  }
}
