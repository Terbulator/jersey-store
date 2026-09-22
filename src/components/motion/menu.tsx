'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { menuReveal, megaMenuItemStagger, megaMenuImageStagger, hoverScale, hoverScaleSmall, hoverLift, hoverArrow } from './motion-variants';

interface MegaMenuPanelProps extends HTMLMotionProps<'div'> {
  open: boolean;
  children: React.ReactNode;
}

export function MegaMenuPanel({ open, children, className, ...props }: MegaMenuPanelProps) {
  return (
    <motion.div
      variants={menuReveal}
      initial="hidden"
      animate={open ? 'visible' : 'hidden'}
      exit="exit"
      className={`fixed top-[72px] left-0 right-0 z-40 max-h-[440px] backdrop-blur-xl ${className || ''}`}
      role="dialog"
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface MegaMenuSectionProps extends HTMLMotionProps<'div'> {
  index: number;
  children: React.ReactNode;
  reducedMotion?: boolean | null;
}

export function MegaMenuSection({ index, children, reducedMotion = false, className, ...props }: MegaMenuSectionProps) {
  const isReduced = reducedMotion ?? false;
  const variants = isReduced ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.01 } } } : megaMenuItemStagger;

  return (
    <motion.div
      variants={variants}
      custom={index}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface MegaMenuImageCardProps extends HTMLMotionProps<'div'> {
  index: number;
  children: React.ReactNode;
  reducedMotion?: boolean | null;
}

export function MegaMenuImageCard({ index, children, reducedMotion = false, className, ...props }: MegaMenuImageCardProps) {
  const isReduced = reducedMotion ?? false;
  const variants = isReduced ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.01 } } } : megaMenuImageStagger;

  return (
    <motion.div
      variants={variants}
      custom={index}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`relative overflow-hidden group cursor-pointer rounded-lg h-full min-h-0 flex flex-col ${className || ''}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface HoverScaleProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  scale?: 'small' | 'medium' | 'large';
  reducedMotion?: boolean | null;
}

export function HoverScale({ children, scale = 'medium', reducedMotion = false, className, ...props }: HoverScaleProps) {
  const variantsMap = {
    small: hoverScaleSmall,
    medium: hoverScale,
    large: { initial: { scale: 1 }, hover: { scale: 1.05, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } } },
  };

  const isReduced = reducedMotion ?? false;
  const variants = isReduced ? { initial: { scale: 1 }, hover: { scale: 1 } } : variantsMap[scale];

  return (
    <motion.div
      variants={variants}
      initial="initial"
      whileHover="hover"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface HoverLiftProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  reducedMotion?: boolean | null;
}

export function HoverLift({ children, reducedMotion = false, className, ...props }: HoverLiftProps) {
  const isReduced = reducedMotion ?? false;
  const variants = isReduced ? { initial: { y: 0 }, hover: { y: 0 } } : hoverLift;

  return (
    <motion.div
      variants={variants}
      initial="initial"
      whileHover="hover"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface HoverArrowProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  reducedMotion?: boolean | null;
}

export function HoverArrow({ children, reducedMotion = false, className, ...props }: HoverArrowProps) {
  const isReduced = reducedMotion ?? false;
  const variants = isReduced ? { initial: { x: 0 }, hover: { x: 0 } } : hoverArrow;

  return (
    <motion.div
      variants={variants}
      initial="initial"
      whileHover="hover"
      className={`inline-flex ${className || ''}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}