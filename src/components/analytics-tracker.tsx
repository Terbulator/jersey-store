'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api')) return;
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    void trackEvent('page_view', { page_url: window.location.href, referrer: referrer || undefined });
    first.current = false;
  }, [pathname]);

  return null;
}
