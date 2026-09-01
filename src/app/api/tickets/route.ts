import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const ticketSchema = z.object({
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  orderId: z.string().optional(),
});

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tickets = await prisma.ticket.findMany({
    where: { customerId: user.id },
    include: {
      replies: { orderBy: { createdAt: 'asc' }, include: { author: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = ticketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid ticket' }, { status: 400 });
  }

  const ticket = await prisma.ticket.create({
    data: {
      subject: parsed.data.subject,
      message: parsed.data.message,
      customerId: user.id,
      orderId: parsed.data.orderId ?? null,
    },
  });

  return NextResponse.json({ ticket }, { status: 201 });
}
