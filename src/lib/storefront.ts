// Server-only storefront data access. All fetchers read published content via the
// anon server client (public RLS). Never import this module from a client bundle —
// import types/mappers from `@/lib/storefront-types` instead.

import { createClient } from '@/lib/supabase/server';
import {
  mapCategory,
  mapEdition,
  mapNavItem,
  mapProduct,
  mapReview,
  type Category,
  type Edition,
  type NavItem,
  type Product,
  type Review,
} from '@/lib/storefront-types';

export type { Category, Edition, NavItem, Product, Review };

// Product fields needed by mapProduct
const PRODUCT_FIELDS = 'id,name,slug,category,edition,team,season,price,compare_price,badge,image,image_alt,images,description,fit,material,care,sizes,shipping_note,returns_note,featured';

export async function getProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_FIELDS)
    .eq('published', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) return [];
  return (data ?? []).map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_FIELDS)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error || !data) return null;
  return mapProduct(data);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_FIELDS)
    .in('id', ids)
    .eq('published', true);

  if (error) return [];
  return (data ?? []).map(mapProduct);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id,slug,name,image,label,description')
    .order('sort_order', { ascending: true });

  if (error) return [];
  return (data ?? []).map(mapCategory);
}

export async function getEditions(): Promise<Edition[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('editions')
    .select('id,slug,name,icon,description')
    .order('sort_order', { ascending: true });

  if (error) return [];
  return (data ?? []).map(mapEdition);
}

export async function getApprovedReviews(): Promise<Review[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('id,product_id,product_name,product_variant,customer_name,customer_email,rating,title,body,verified_buyer,featured,photo_url,created_at')
    .eq('status', 'approved')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data ?? []).map(mapReview);
}

export async function getNavItems(): Promise<NavItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('navigation_items')
    .select('id,section,label,href,active,sort_order')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) return [];
  return (data ?? []).map(mapNavItem);
}