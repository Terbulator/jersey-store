import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string, currency = 'INR') {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length = 100) {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '…';
}

export function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
  return `JS-${timestamp}-${random}`;
}
