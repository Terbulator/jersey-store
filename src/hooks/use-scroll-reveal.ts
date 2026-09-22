'use client';

import { useRef, useEffect, useState } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

export function useScrollReveal<T extends HTMLElement = HTMLElement>(options: UseScrollRevealOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '-80px',
    triggerOnce = true,
    delay = 0,
  } = options;

  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || (triggerOnce && hasTriggered)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true);
              if (triggerOnce) setHasTriggered(true);
            }, delay);
          } else {
            setIsVisible(true);
            if (triggerOnce) setHasTriggered(true);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, delay, hasTriggered]);

  return { ref, isVisible };
}

export function useReducedMotion() {
  const [shouldReduce, setShouldReduce] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduce(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setShouldReduce(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return shouldReduce;
}

export function useStaggeredReveal<T extends HTMLElement>(
  itemCount: number,
  options: UseScrollRevealOptions & { staggerDelay?: number } = {}
) {
  const { staggerDelay = 80, ...rest } = options;
  const ref = useRef<T>(null);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          for (let i = 0; i < itemCount; i++) {
            setTimeout(() => {
              setVisibleIndices((prev) => new Set([...prev, i]));
            }, i * staggerDelay);
          }
          observer.unobserve(element);
        }
      },
      { threshold: rest.threshold ?? 0.1, rootMargin: rest.rootMargin ?? '-80px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [itemCount, staggerDelay, rest.threshold, rest.rootMargin]);

  return { ref, visibleIndices };
}