'use client';

import { useEffect, useState } from 'react';

const MESSAGES = [
  'FREE SHIPPING OVER ₹999',
  '30-DAY RETURNS',
  'PLAYER VERSION & MASTER EDITION',
  'OFFICIAL KITS — 2026 SEASON',
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-black border-b border-white/10">
      <div className="h-full flex items-center justify-center overflow-hidden px-4">
        <span
          key={index}
          className="announcement-track font-mono-meta text-[10px] text-off-white/80"
        >
          {MESSAGES[index]}
        </span>
      </div>
    </div>
  );
}