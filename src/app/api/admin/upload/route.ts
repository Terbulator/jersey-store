import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  await requireAdmin();
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file.' }, { status: 400 });

  const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported image type.' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 10 MB.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'png';
  const path = `homepage/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const sb = await adminDataClient();
  const { error: upErr } = await sb.storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (upErr) return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });

  const { data: urlData } = sb.storage.from('product-images').getPublicUrl(path);
  const url = urlData?.publicUrl ?? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
  return NextResponse.json({ url });
}
