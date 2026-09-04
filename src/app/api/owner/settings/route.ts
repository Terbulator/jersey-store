import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOwnerUser } from '@/lib/owner-guard';
import { logAudit } from '@/lib/audit';
import { slugify } from '@/lib/utils';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const guarded = await getOwnerUser();
    if (!guarded.ok) return guarded.error;
    return NextResponse.json({ vendor: guarded.vendor });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const guarded = await getOwnerUser();
  if (!guarded.ok) return guarded.error;
  const { vendor, user } = guarded;

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.storeName !== undefined && body.storeName) data.storeName = body.storeName;
  if (body.description !== undefined) data.description = body.description ?? null;
  if (body.logo !== undefined) data.logo = body.logo ?? null;
  if (body.banner !== undefined) data.banner = body.banner ?? null;
  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  try {
    if (data.storeName && data.storeName !== vendor.storeName) {
      data.slug = slugify(String(data.storeName) + '-' + vendor.id.slice(0, 6));
    }
    const updated = await prisma.vendor.update({ where: { id: vendor.id }, data });

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'settings.update',
      resource: 'vendor',
      resourceId: vendor.id,
      oldValues: { storeName: vendor.storeName },
      newValues: { storeName: updated.storeName },
    });

    return NextResponse.json({ vendor: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
