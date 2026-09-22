'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import {
  slideInRight,
  slideInBottom,
  drawerBackdrop,
  mobileDrawer,
  accordionItem,
} from './motion-variants';

interface DrawerProps extends HTMLMotionProps<'div'> {
  open: boolean;
  onClose: () => void;
  position?: 'right' | 'bottom';
  children: React.ReactNode;
}

export function Drawer({ open, onClose, position = 'right', children, className, ...props }: DrawerProps) {
  const variants = position === 'right' ? slideInRight : slideInBottom;

  return (
    <>
      {open && (
        <motion.div
          variants={drawerBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/40 z-50"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <motion.div
        variants={variants}
        initial="hidden"
        animate={open ? 'visible' : 'hidden'}
        exit="exit"
        className={`fixed ${position === 'right' ? 'top-0 right-0 h-full w-full max-w-md' : 'bottom-0 left-0 right-0 h-auto'} bg-white z-50 shadow-2xl flex flex-col ${className || ''}`}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
}

export function MobileDrawer({ open, onClose, children, className, ...props }: DrawerProps) {
  return (
    <>
      {open && (
        <motion.div
          variants={drawerBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/40 z-50"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <motion.div
        variants={mobileDrawer}
        initial="hidden"
        animate={open ? 'visible' : 'hidden'}
        exit="exit"
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col ${className || ''}`}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
}

export function AccordionItem({ open, children, className, ...props }: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
} & Omit<HTMLMotionProps<'div'>, 'children'>) {
  return (
    <motion.div
      variants={accordionItem}
      animate={open ? 'open' : 'closed'}
      className={`overflow-hidden ${className || ''}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}