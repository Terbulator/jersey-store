import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { adminDataClient } from '@/lib/admin-session';
import { authorize } from '@/lib/api-guard';
import { checkMutation } from '@/lib/security';
import { validateUpload, UPLOAD_FOLDERS } from '@/lib/upload-guard';
import { logAudit } from '@/lib/audit';

// Admin media upload.
//
// Runs on the Node runtime on purpose: the Edge runtime has a much lower request
// body ceiling, so the size limits below would be unenforceable there.
//
// Authorization happens before the body is read and before the service-role client
// is constructed, so an unauthenticated caller never reaches storage.

// Hard ceiling enforced by the platform, independent of our own checks.
export const maxDuration = 30;

const BUCKET = 'product-images';

export async function POST(req: NextRequest) {
  const guard = await authorize({ permission: 'media:write' });
  if (!guard.ok) return guard.response;
  const blocked = checkMutation(req, 'upload');
  if (blocked) return blocked;

  const folder = new URL(req.url).searchParams.get('folder') ?? 'media';
  if (!(UPLOAD_FOLDERS as readonly string[]).includes(folder)) {
    return NextResponse.json({ error: 'Unknown upload folder.' }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Could not read the upload.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!file || typeof file === 'string' || typeof (file as File).arrayBuffer !== 'function') {
    return NextResponse.json({ error: 'No file.' }, { status: 400 });
  }

  const upload = file as File;
  const bytes = new Uint8Array(await upload.arrayBuffer());

  const verdict = validateUpload(
    {
      declaredType: upload.type,
      size: upload.size,
      bytes,
      folder,
      name: upload.name ?? '',
    },
    // CSPRNG suffix; the client filename never reaches storage.
    randomBytes(8).toString('hex')
  );

  if (!verdict.ok) {
    return NextResponse.json({ error: verdict.error }, { status: 400 });
  }

  const sb = await adminDataClient();
  const { error: uploadError } = await sb.storage.from(BUCKET).upload(verdict.path, bytes, {
    cacheControl: '3600',
    upsert: false,
    contentType: verdict.mime,
  });
  if (uploadError) {
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }

  const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(verdict.path);
  const url = urlData?.publicUrl ?? '';

  await logAudit(sb, {
    actor: guard.actor.user.email ?? null,
    role: guard.actor.role,
    action: 'upload',
    resource: 'media',
    summary: `${verdict.path} (${bytes.byteLength} bytes, ${verdict.dimensions?.width ?? '?'}x${verdict.dimensions?.height ?? '?'})`,
  });

  return NextResponse.json({
    url,
    path: verdict.path,
    // The stored name, not the client-supplied one.
    fileName: verdict.path.split('/').pop() ?? verdict.path,
    mimeType: verdict.mime,
    sizeBytes: bytes.byteLength,
  });
}