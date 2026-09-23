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

export async function getProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
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
    .select('*')
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
    .select('*')
    .in('id', ids)
    .eq('published', true);

  if (error) return [];
  return (data ?? []).map(mapProduct);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return [];
  return (data ?? []).map(mapCategory);
}

export async function getEditions(): Promise<Edition[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('editions')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return [];
  return (data ?? []).map(mapEdition);
}

export async function getApprovedReviews(): Promise<Review[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
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
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) return [];
  return (data ?? []).map(mapNavItem);
}