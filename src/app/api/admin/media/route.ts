import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { makeCrudApi } from '@/lib/admin-crud';
import { isSafeUrl } from '@/lib/section-schemas';
import { findMediaUsage } from '@/lib/media-usage';
import { checkOrigin, checkRateLimit } from '@/lib/security';
import { logAudit } from '@/lib/audit';

const crud = makeCrudApi({
  table: 'media_assets',
  fields: ['url', 'file_name', 'mime_type', 'alt'],
  require: 'url',
  numericFields: ['size_bytes'],
  defaults: { kind: 'image' },
  validate: (row) => {
    if (row.url !== undefined && !isSafeUrl(row.url)) return 'Asset URL scheme not allowed.';
    return null;
  },
});

export const POST = crud.POST;
export const PATCH = crud.PATCH;

// Library picker feed (the uploader calls GET /api/admin/media).
export async function GET() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('media_assets')
    .select('id, url, file_name, alt, kind')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: 'Could not load library.' }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

// Delete is usage-guarded: referenced assets are blocked unless force is set,
// and the storage object is removed best-effort alongside the row.
export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req, 'expensive');
  if (blocked) return blocked;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  const sb = await adminDataClient();
  const { data: row } = await sb.from('media_assets').select('url').eq('id', body.id).maybeSingle();
  const url = (row as { url?: string } | null)?.url ?? '';
  if (url) {
    const usage = await findMediaUsage(sb, url);
    if (usage.length > 0 && !body.force) {
      return NextResponse.json(
        { error: `This image is used in ${usage.length} place${usage.length === 1 ? '' : 's'}.`, usage },
        { status: 409 }
      );
    }
    const marker = '/product-images/';
    const at = url.indexOf(marker);
    if (at !== -1) {
      await sb.storage.from('product-images').remove([url.slice(at + marker.length)]);
    }
  }
  const { error } = await sb.from('media_assets').delete().eq('id', body.id);
  if (error) return NextResponse.json({ error: 'Could not delete asset.' }, { status: 500 });
  await logAudit(sb, { actor: session.user.email ?? null, role: session.role, action: 'delete', resource: 'media', resourceId: String(body.id), summary: url });
  return NextResponse.json({ ok: true });
}
