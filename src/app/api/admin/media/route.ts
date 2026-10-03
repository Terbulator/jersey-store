import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDataClient } from '@/lib/admin-session';
import { authorize } from '@/lib/api-guard';
import { makeCrudApi } from '@/lib/admin-crud';
import { isSafeUrl } from '@/lib/section-schemas';
import { findMediaUsage } from '@/lib/media-usage';
import { checkMutation } from '@/lib/security';
import { logAudit } from '@/lib/audit';

const BUCKET = 'product-images';

const crud = makeCrudApi({
  table: 'media_assets',
  fields: ['url', 'file_name', 'mime_type', 'alt'],
  write: 'media:write',
  remove: 'media:delete',
  read: 'media:read',
  require: 'url',
  numericFields: ['size_bytes'],
  defaults: { kind: 'image' },
  // media_assets has no updated_at column; bumping it would make every PATCH fail.
  hasUpdatedAt: false,
  validate: (row) => {
    // Blocks javascript:/data: URLs that would otherwise be stored and later
    // rendered into <img src> or CSS across the storefront.
    if (row.url !== undefined && !isSafeUrl(row.url)) return 'Asset URL scheme not allowed.';
    return null;
  },
});

export const POST = crud.POST;
export const PATCH = crud.PATCH;

// Library picker feed (the uploader calls GET /api/admin/media).
export async function GET() {
  const guard = await authorize({ permission: 'media:read' });
  if (!guard.ok) return guard.response;
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
  const guard = await authorize({ permission: 'media:delete' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req, 'expensive');
  if (blocked) return blocked;

  const parsed = z
    .object({ id: z.string().uuid(), force: z.boolean().optional() })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid asset id.' }, { status: 400 });

  const sb = await adminDataClient();
  const { data: row } = await sb.from('media_assets').select('url').eq('id', parsed.data.id).maybeSingle();
  const url = (row as { url?: string } | null)?.url ?? '';
  if (url) {
    const usage = await findMediaUsage(sb, url);
    if (usage.length > 0 && !parsed.data.force) {
      return NextResponse.json(
        { error: `This image is used in ${usage.length} place${usage.length === 1 ? '' : 's'}.`, usage },
        { status: 409 }
      );
    }
    // Only ever delete inside our own bucket, and only the path segment — never a
    // caller-supplied string that could name an object in another bucket.
    const marker = `/${BUCKET}/`;
    const at = url.indexOf(marker);
    if (at !== -1) {
      const objectPath = url.slice(at + marker.length);
      if (objectPath && !objectPath.includes('..')) {
        await sb.storage.from(BUCKET).remove([objectPath]);
      }
    }
  }
  const { error } = await sb.from('media_assets').delete().eq('id', parsed.data.id);
  if (error) return NextResponse.json({ error: 'Could not delete asset.' }, { status: 500 });
  await logAudit(sb, {
    actor: guard.actor.user.email ?? null,
    role: guard.actor.role,
    action: 'delete',
    resource: 'media',
    resourceId: parsed.data.id,
    summary: url.slice(0, 300),
  });
  return NextResponse.json({ ok: true });
}