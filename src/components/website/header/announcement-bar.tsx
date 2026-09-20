'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const MESSAGES = [
  'PRE-BOOKING NOW OPEN — LIMITED STOCK',
  'FREE SHIPPING ABOVE ₹999',
  'NEW DROP LIVE',
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
    <div className="bg-charcoal text-off-white text-[10px] tracking-[0.2em] uppercase text-center py-2 px-4 relative overflow-hidden h-8 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          {MESSAGES[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
