'use client';

import { motion } from 'framer-motion';
import { fadeIn } from '@/components/motion/motion-variants';

export function AnnouncementBar() {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="announcement-bar w-full text-center"
    >
      <span className="text-[10px] tracking-[0.2em] uppercase">FREE SHIPPING ON ORDERS OVER ₹999 — 30 DAY RETURNS — SECURE PAYMENT</span>
    </motion.div>
  );
}