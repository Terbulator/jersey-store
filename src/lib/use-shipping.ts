'use client';

import { useEffect, useState } from 'react';

export type ShippingConfig = { freeThreshold: number; rate: number; message: string };

const DEFAULT: ShippingConfig = { freeThreshold: 999, rate: 99, message: 'Free shipping on orders above ₹999' };

export function useShipping(): ShippingConfig {
  const [cfg, setCfg] = useState(DEFAULT);

  useEffect(() => {
    let mounted = true;
    fetch('/api/settings')
      .then((r) => r.json())
      .then((v: Record<string, unknown>) => {
        if (!mounted) return;
        setCfg({
          freeThreshold: Number(v.free_threshold) || DEFAULT.freeThreshold,
          rate: Number(v.rate) || DEFAULT.rate,
          message: String(v.message ?? DEFAULT.message),
        });
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return cfg;
}