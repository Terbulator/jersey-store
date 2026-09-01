'use client';

import { useEffect } from 'react';
import { useCart } from '@/store/cart';

/**
 * Pushes a server-read referral code into the cart store so checkout can
 * attribute the order to a reseller. Renders nothing.
 */
export function ReferralHydrator({ referralCode }: { referralCode?: string }) {
  const setReferral = useCart((s) => s.setReferral);
  const existing = useCart((s) => s.referralCode);

  useEffect(() => {
    if (referralCode && referralCode !== existing) {
      setReferral(referralCode);
    }
  }, [referralCode, setReferral, existing]);

  return null;
}