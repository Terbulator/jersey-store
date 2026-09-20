'use client';

import { useState, useEffect } from 'react';

const MESSAGES = [
  'PRE-BOOKING NOW OPEN • LIMITED STOCK',
  'FREE SHIPPING ABOVE ₹999',
  'NEW DROP LIVE',
  'LIMITED EDITION JERSEYS',
  'WORLD CUP COLLECTION AVAILABLE',
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-charcoal text-off-white text-xs tracking-widest uppercase text-center py-2 px-4">
      <span className="inline-block transition-opacity duration-300" key={index}>
        {MESSAGES[index]}
      </span>
    </div>
  );
}