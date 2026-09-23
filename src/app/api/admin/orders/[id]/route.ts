import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { checkOrigin, checkRateLimit } from '@/lib/security';
import { logAudit } from '@/lib/audit';

const VALID_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
  if (blocked) return blocked;
  const { status } = await req.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }
  const sb = await adminDataClient();
  const { error } = await sb.from('orders').update({ status }).eq('id', params.id);
  if (error) return NextResponse.json({ error: 'Could not update order.' }, { status: 500 });
  await logAudit(sb, { actor: session.user.email ?? null, role: session.role, action: 'status', resource: 'orders', resourceId: params.id, summary: status });
  return NextResponse.json({ ok: true });
}