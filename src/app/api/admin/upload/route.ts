import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { checkOrigin, checkRateLimit } from '@/lib/security';
import { logAudit } from '@/lib/audit';

export const runtime = 'edge';

const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];
const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};
const FOLDERS = ['homepage', 'products', 'pages', 'media', 'header', 'misc'];

// Magic-byte sniff: the stored extension and content type come from the
// verified bytes, never from the client-supplied name or MIME.
function sniffedMime(head: Uint8Array): string | null {
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return 'image/png';
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'image/jpeg';
  if (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x38) return 'image/gif';
  if (
    head.length >= 12 && head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 &&
    head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50
  ) return 'image/webp';
  if (head.length >= 12 && head[4] === 0x66 && head[5] === 0x74 && head[6] === 0x79 && head[7] === 0x70) {
    const brand = String.fromCharCode(head[8], head[9], head[10], head[11]);
    if (brand === 'avif' || brand === 'avis' || brand === 'mif1') return 'image/avif';
  }
  return null;
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  const limited = checkRateLimit(req, 'upload');
  if (limited) return limited;
  const originErr = checkOrigin(req);
  if (originErr) return originErr;

  const folder = new URL(req.url).searchParams.get('folder') ?? 'homepage';
  if (!FOLDERS.includes(folder)) {
    return NextResponse.json({ error: 'Unknown upload folder.' }, { status: 400 });
  }
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file || typeof file.arrayBuffer !== 'function') {
    return NextResponse.json({ error: 'No file.' }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported image type.' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 10 MB.' }, { status: 400 });
  }
  let head: Uint8Array;
  try {
    head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  } catch {
    return NextResponse.json({ error: 'Could not read file.' }, { status: 400 });
  }
  if (sniffedMime(head) !== file.type) {
    return NextResponse.json({ error: 'File content does not match its type.' }, { status: 400 });
  }

  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${EXT[file.type]}`;
  const sb = await adminDataClient();
  const { error: upErr } = await sb.storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (upErr) return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });

  const { data: urlData } = sb.storage.from('product-images').getPublicUrl(path);
  const url = urlData?.publicUrl ?? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
  await logAudit(sb, {
    actor: session.user.email ?? null,
    role: session.role,
    action: 'upload',
    resource: 'media',
    summary: `${folder}/${file.name} (${file.size} bytes)`,
  });
  return NextResponse.json({ url, fileName: file.name, mimeType: file.type, sizeBytes: file.size });
}
