import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await prisma.reseller.findUnique({ where: { userId: user.id } });
  if (existing) {
    return NextResponse.json({ error: `Already applied (${existing.status.toLowerCase()})` }, { status: 409 });
  }

  const referralCode = (user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8) || 'REF') +
    Math.random().toString(36).slice(2, 6).toUpperCase();

  const reseller = await prisma.reseller.create({
    data: { userId: user.id, referralCode },
  });

  return NextResponse.json({ reseller }, { status: 201 });
}
