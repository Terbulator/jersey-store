import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NextResponse } from 'next/server';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string, currency = 'INR') {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (currency === 'INR') {
    return `₹${num.toLocaleString('en-IN')}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num);
}

// Cache-Control header utilities
export const CACHE_HEADERS = {
  // Static assets - 1 year, immutable
  static: 'public, max-age=31536000, immutable',
  // Public catalog data - 5 minutes stale-while-revalidate
  publicCatalog: 'public, max-age=60, stale-while-revalidate=300',
  // Public homepage content - 1 minute
  publicPage: 'public, max-age=60, stale-while-revalidate=120',
  // Private user data - no cache
  private: 'private, no-cache, no-store, must-revalidate',
  // No cache
  none: 'no-store',
} as const;

export function withCacheHeaders(res: NextResponse, cacheType: keyof typeof CACHE_HEADERS) {
  res.headers.set('Cache-Control', CACHE_HEADERS[cacheType]);
  return res;
}

export const ROUTES = {
  HOME: '/',
  SHOP: '/shop',
  FOOTBALL: '/shop/football',
  CRICKET: '/shop/cricket',
  STREETWEAR: '/shop/streetwear',
  NEW_ARRIVALS: '/shop/new-arrivals',
  BEST_SELLERS: '/shop/best-sellers',
  SALE: '/shop/sale',
  WISHLIST: '/wishlist',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ACCOUNT: '/account',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  SEARCH: '/search',
  ACCOUNT_ORDERS: '/account/orders',
  ACCOUNT_ADDRESSES: '/account/addresses',
} as const;