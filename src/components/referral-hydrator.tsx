'use client';

import { useEffect } from 'react';
import { useCart } from '@/store/cart';

/**
 * Reads the `jersey-ref` cookie (set by middleware when the URL has ?ref=...)
 * and pushes the code into the cart store so checkout can attribute the order
 * to a reseller. Renders nothing.
 */
export function ReferralHydrator() {
  const setReferral = useCart((s) => s.setReferral);
  const existing = useCart((s) => s.referralCode);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const match = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('jersey-ref='));
    if (!match) return;
    const code = decodeURIComponent(match.split('=')[1] || '').trim();
    if (code && code !== existing) {
      setReferral(code);
    }
  }, [setReferral, existing]);

  return null;
}
