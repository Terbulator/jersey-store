import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getResellerUser } from '@/lib/reseller-guard';

export async function POST(req: NextRequest) {
  const guarded = await getResellerUser();
  if (!guarded.ok) return guarded.error;
  const { reseller } = guarded;

  const body = await req.json();
  const amount = Number(body.amount);

  const outstandings = await prisma.resellerSale.aggregate({
    where: { resellerId: reseller.id, status: 'PENDING' },
    _sum: { commissionEarned: true },
  });
  const available = outstandings._sum.commissionEarned ? Number(outstandings._sum.commissionEarned) : 0;

  if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  if (amount > available) {
    return NextResponse.json({ error: `You can withdraw at most ${available}` }, { status: 400 });
  }

  const existingPending = await prisma.resellerPayoutRequest.findFirst({
    where: { resellerId: reseller.id, status: 'PENDING' },
  });
  if (existingPending) {
    return NextResponse.json({ error: 'You already have a pending payout request' }, { status: 400 });
  }

  const payout = await prisma.resellerPayoutRequest.create({
    data: { resellerId: reseller.id, amount },
  });

  return NextResponse.json({ payout }, { status: 201 });
}
