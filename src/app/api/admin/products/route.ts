import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, adminDataClient } from '@/lib/admin';

const productSchema = z.object({
  slug: z.string().min(1).max(160),
  name: z.string().min(1).max(160),
  category: z.string().min(1).max(80),
  edition: z.string().min(1).max(80),
  team: z.string().optional(),
  season: z.string().optional(),
  badge: z.string().optional(),
  price: z.coerce.number().min(0),
  compare_price: z.coerce.number().min(0).nullable().optional(),
  image: z.string().url().optional().or(z.literal('')),
  image_alt: z.string().optional(),
  description: z.string().optional(),
  fit: z.string().optional(),
  material: z.string().optional(),
  care: z.string().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  await requireAdmin();
  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid product details.', issues: parsed.error.flatten() }, { status: 400 });
  }
  const sb = await adminDataClient();
  const { data, error } = await sb.from('products').insert({
    ...parsed.data,
    compare_price: parsed.data.compare_price ?? null,
    image: parsed.data.image || null,
  }).select('id').single();
  if (error) return NextResponse.json({ error: 'Could not create product.' }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}