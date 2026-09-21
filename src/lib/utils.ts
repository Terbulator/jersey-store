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