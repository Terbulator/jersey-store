import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDataClient } from '@/lib/admin';
import { isRateLimited } from '@/lib/rate-limit';

const reviewSchema = z.object({
  customerName: z.string().trim().min(1).max(80),
  customerEmail: z.string().trim().email().max(254),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(2000),
  productId: z.string().uuid(),
  photoUrl: z.string().max(1_500_000).optional().nullable(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(`reviews:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests, please slow down.' }, { status: 429 });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing or invalid review details.', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const p = parsed.data;

  const sb = await adminDataClient();
  const { data: product } = await sb
    .from('products')
    .select('id, name, edition')
    .eq('id', p.productId)
    .maybeSingle();
  if (!product) {
    return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });
  }

  const { data: edition } = await sb
    .from('editions')
    .select('name')
    .eq('slug', product.edition)
    .maybeSingle();

  const { error } = await sb.from('reviews').insert({
    product_id: p.productId,
    product_name: product.name,
    product_variant: edition?.name ?? product.edition,
    customer_name: p.customerName,
    customer_email: p.customerEmail,
    rating: p.rating,
    title: p.title,
    body: p.body,
    photo_url: p.photoUrl || null,
    verified_buyer: false,
    status: 'pending',
    featured: false,
  });

  if (error) {
    return NextResponse.json({ error: 'Could not save your review.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}