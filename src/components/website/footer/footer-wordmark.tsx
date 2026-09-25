'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const;

export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.1 });
  const reduce = useReducedMotion();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setMobile(mq.matches);
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const hidden = reduce
    ? { opacity: 1 }
    : mobile
      ? { opacity: 0, y: '100%', scale: 0.97, filter: 'blur(6px)' }
      : { opacity: 0, y: '100%', scale: 0.97, filter: 'blur(6px)' };
  const shown = { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' };

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="select-none pointer-events-none"
    >
      <motion.h2
        initial={reduce ? shown : hidden}
        animate={inView ? shown : hidden}
        transition={{
          duration: reduce ? 0 : mobile ? 1.15 : 1.4,
          ease: EASE_EDITORIAL,
        }}
        className="font-display font-normal text-[13vw] sm:text-[15vw] md:text-[16vw] lg:text-[13vw] xl:text-[12vw] leading-[1.05] tracking-[-0.01em] whitespace-nowrap text-center text-[#A8A8A8]"
        style={{ fontWeight: 300, fontFamily: "'Instrument Serif', Georgia, serif" }}
      >
        HEADERR
        <span className="inline-block text-[0.14em] align-super leading-none translate-y-[0.12em]">
          ®
        </span>
      </motion.h2>
    </div>
  );
}
