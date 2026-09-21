'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FootballPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/shop?category=football');
  }, [router]);
  return null;
}