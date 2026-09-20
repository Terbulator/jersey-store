import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

export function cx(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(' ');
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

export function generateOrderNumber() {
  return `HDR-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
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
  SEARCH: '/search',
  ACCOUNT_ORDERS: '/account/orders',
  ACCOUNT_ADDRESSES: '/account/addresses',
} as const;