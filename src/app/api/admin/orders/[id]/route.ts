import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';

const VALID_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin();
  const { status } = await req.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }
  const sb = await adminDataClient();
  const { error } = await sb.from('orders').update({ status }).eq('id', params.id);
  if (error) return NextResponse.json({ error: 'Could not update order.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}