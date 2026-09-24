import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withCacheHeaders } from '@/lib/utils';

// Public read of select site_settings (RLS allows anon SELECT).
// Storefront cart/checkout read shipping config from here.

const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

export async function GET() {
  const { data } = await anon
    .from('site_settings')
    .select('value')
    .eq('key', 'shipping')
    .maybeSingle();

  return withCacheHeaders(
    NextResponse.json(data?.value ?? ({} as Record<string, unknown>)),
    'publicCatalog'
  );
}