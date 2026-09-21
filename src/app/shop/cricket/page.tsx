'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CricketPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/shop?category=cricket');
  }, [router]);
  return null;
}