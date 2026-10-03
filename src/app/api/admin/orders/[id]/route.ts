import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDataClient } from '@/lib/admin-session';
import { authorize } from '@/lib/api-guard';
import { checkMutation } from '@/lib/security';
import { logAudit } from '@/lib/audit';
import { toStockLines } from '@/lib/order-stock';

// Order status transitions. Fulfillment only: `payment_status` is deliberately NOT
// writable here, so nobody can mark an order paid through this endpoint. Stock is
// released when an order is cancelled so the units become sellable again.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const statusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await authorize({ permissions: ['orders:update_status', 'orders:read'] });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req);
  if (blocked) return blocked;

  if (!UUID.test(params.id)) {
    return NextResponse.json({ error: 'Invalid order id.' }, { status: 400 });
  }

  const parsed = statusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  // Changing payment state is a finance action, gated separately from fulfillment.
  if (parsed.data.paymentStatus !== undefined) {
    const finance = await authorize({ permission: 'orders:write' });
    if (!finance.ok) return finance.response;
  }

  const sb = await adminDataClient();
  const { data: before, error: readError } = await sb
    .from('orders')
    .select('status, payment_status, items')
    .eq('id', params.id)
    .maybeSingle();

  if (readError || !before) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const updates: Record<string, unknown> = {
    status: parsed.data.status,
    updated_at: new Date().toISOString(),
  };
  if (parsed.data.paymentStatus !== undefined) updates.payment_status = parsed.data.paymentStatus;

  const { error } = await sb.from('orders').update(updates).eq('id', params.id);
  if (error) return NextResponse.json({ error: 'Could not update order.' }, { status: 500 });

  // Return reserved stock when an order is cancelled or refunded. The stored `items`
  // use camelCase, so they must be normalised to the snake_case shape
  // release_order_stock reads — passing them raw released nothing.
  const voiding = parsed.data.status === 'CANCELLED' || parsed.data.status === 'REFUNDED';
  if (voiding && before.status !== 'CANCELLED' && before.status !== 'REFUNDED') {
    const stockLines = toStockLines(before.items);
    if (stockLines.length > 0) {
      await sb.rpc('release_order_stock', { p_lines: stockLines });
    }
  }

  await logAudit(sb, {
    actor: guard.actor.user.email ?? null,
    role: guard.actor.role,
    action: 'status',
    resource: 'orders',
    resourceId: params.id,
    summary: parsed.data.status,
  });
  return NextResponse.json({ ok: true });
}