'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { fadeIn, fadeUp, scaleReveal, imageReveal, clipReveal, staggerContainer, staggerItem, lineReveal } from './motion-variants';
import React from 'react';

interface RevealProps extends HTMLMotionProps<'div'> {
  variant?: 'fade' | 'up' | 'scale' | 'image' | 'clip' | 'stagger' | 'line';
  delay?: number;
  staggerDelay?: number;
  children: React.ReactNode;
}

export function Reveal({
  variant = 'up',
  delay = 0,
  staggerDelay = 80,
  children,
  className,
  ...props
}: RevealProps) {
  const { ref, isVisible } = useScrollReveal({ delay, triggerOnce: true });

  const variants = {
    fade: fadeIn,
    up: fadeUp,
    scale: scaleReveal,
    image: imageReveal,
    clip: clipReveal,
    stagger: staggerContainer,
    line: lineReveal,
  }[variant];

  if (variant === 'stagger') {
    return (
      <motion.div
        ref={ref as React.RefObject<HTMLDivElement>}
        variants={variants}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        className={className}
        {...props}
      >
        {React.Children.map(children, (child, index) =>
          React.isValidElement(child) ? (
            React.cloneElement(child as React.ReactElement, {
              variants: staggerItem,
              style: { ...(child.props.style || {}), '--stagger-index': index },
            })
          ) : child
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      variants={variants}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      style={{ transitionDelay: `${delay}ms` }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface RevealBaseProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function RevealImage({ children, className, delay = 0, ...props }: RevealBaseProps) {
  const { ref, isVisible } = useScrollReveal({ delay, triggerOnce: true });

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`overflow-hidden ${className || ''}`} {...props}>
      <motion.div
        variants={imageReveal}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function RevealText({ children, className, delay = 0, ...props }: RevealBaseProps) {
  const { ref, isVisible } = useScrollReveal({ delay, triggerOnce: true });

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`overflow-hidden ${className || ''}`} {...props}>
      <motion.div
        variants={clipReveal}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function StaggerChildren({
  children,
  className,
  stagger = 80,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollReveal({ delay, triggerOnce: true });

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      variants={staggerContainer}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      className={className}
    >
      {React.Children.map(children, (child, index) =>
        React.isValidElement(child) ? (
          React.cloneElement(child as React.ReactElement, {
            variants: staggerItem,
            style: {
              ...(child.props.style || {}),
              transitionDelay: `${index * stagger}ms`,
            },
          })
        ) : child
      )}
    </motion.div>
  );
}