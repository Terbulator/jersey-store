import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKETS ?? 'product-images';

export async function ensureBucket() {
  const supabase = createAdminClient();
  const { data: existing } = await supabase.storage.getBucket(BUCKET);
  if (!existing) {
    await supabase.storage.createBucket(BUCKET, { public: true });
  }
  return BUCKET;
}

export async function uploadProductImage(
  file: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ path: string; url: string }> {
  await ensureBucket();
  const supabase = createAdminClient();
  const path = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: mimeType });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function deleteImage(path: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error('Failed to delete image:', error.message);
    return { error: error.message };
  }
  return {};
}
