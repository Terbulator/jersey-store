'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StreetwearPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/shop?category=streetwear');
  }, [router]);
  return null;
}