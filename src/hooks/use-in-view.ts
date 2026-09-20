'use client';

import { useRef } from 'react';
import { useInView as framerUseInView, type UseInViewOptions } from 'framer-motion';

export function useInView(options?: UseInViewOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = framerUseInView(ref, {
    once: true,
    margin: '-80px',
    ...options,
  });
  return { ref, isInView };
}
