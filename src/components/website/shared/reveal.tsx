'use client';

import { motion, type MotionProps } from 'framer-motion';
import { useInView } from '@/hooks/use-in-view';

interface RevealProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

const directionMap = {
  up: { y: 30, x: 0 },
  down: { y: -30, x: 0 },
  left: { x: 30, y: 0 },
  right: { x: -30, y: 0 },
  none: { x: 0, y: 0 },
};

export function Reveal({ children, className, delay = 0, direction = 'up', ...props }: RevealProps) {
  const { ref, isInView } = useInView();
  const offset = directionMap[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...offset }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...offset }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function RevealImage({ children, className, delay = 0 }: Omit<RevealProps, 'direction'>) {
  const { ref, isInView } = useInView();

  return (
    <div ref={ref} className={`overflow-hidden ${className || ''}`}>
      <motion.div
        initial={{ opacity: 0, scale: 1.08 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.08 }}
        transition={{
          duration: 0.9,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function RevealLine({ className, delay = 0 }: { className?: string; delay?: number }) {
  const { ref, isInView } = useInView();

  return (
    <div ref={ref} className={`overflow-hidden ${className || ''}`}>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="h-px bg-charcoal/10 origin-left"
      />
    </div>
  );
}

export function StaggerChildren({
  children,
  className,
  stagger = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const { ref, isInView } = useInView();

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        visible: {
          transition: {
            staggerChildren: stagger,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
