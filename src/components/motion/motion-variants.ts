import { Variants } from 'framer-motion';

export const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  micro: 0.15,
  ui: 0.25,
  component: 0.35,
  drawer: 0.4,
  menu: 0.4,
  scroll: 0.6,
  editorial: 0.8,
  hero: 1.4,
} as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.scroll, ease: EASE_PREMIUM },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.editorial, ease: EASE_PREMIUM },
  },
};

export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.scroll, ease: EASE_PREMIUM },
  },
};

export const scaleReveal: Variants = {
  hidden: { opacity: 0, scale: 1.06 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.hero, ease: EASE_PREMIUM },
  },
};

export const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.06 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.hero, ease: EASE_PREMIUM },
  },
};

export const clipReveal: Variants = {
  hidden: { clipPath: 'inset(0 0 100% 0)' },
  visible: {
    clipPath: 'inset(0 0 0% 0)',
    transition: { duration: DURATION.editorial, ease: EASE_PREMIUM },
  },
};

export const slideInRight: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { duration: DURATION.drawer, ease: EASE_PREMIUM },
  },
  exit: {
    x: '100%',
    transition: { duration: DURATION.drawer, ease: EASE_PREMIUM },
  },
};

export const slideInBottom: Variants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { duration: DURATION.drawer, ease: EASE_PREMIUM },
  },
  exit: {
    y: '100%',
    transition: { duration: DURATION.drawer, ease: EASE_PREMIUM },
  },
};

export const menuReveal: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.menu, ease: EASE_PREMIUM },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: DURATION.menu, ease: EASE_PREMIUM },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.scroll, ease: EASE_PREMIUM },
  },
};

export const staggerItemFast: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.scroll, ease: EASE_PREMIUM },
  },
};

export const lineReveal: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.3, ease: EASE_PREMIUM },
  },
};

export const hoverScale: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.03, transition: { duration: 0.35, ease: EASE_PREMIUM } },
};

export const hoverScaleSmall: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.4, ease: EASE_PREMIUM } },
};

export const hoverLift: Variants = {
  initial: { y: 0 },
  hover: { y: -4, transition: { duration: 0.3, ease: EASE_PREMIUM } },
};

export const hoverArrow: Variants = {
  initial: { x: 0 },
  hover: { x: 4, transition: { duration: 0.3, ease: EASE_PREMIUM } },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.editorial, ease: EASE_PREMIUM },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: DURATION.ui, ease: EASE_PREMIUM },
  },
};

export const headerEntrance: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_PREMIUM },
  },
};

export const headerNavStagger: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: DURATION.scroll,
      ease: EASE_PREMIUM,
    },
  }),
};

export const headerIconStagger: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + i * 0.05,
      duration: DURATION.scroll,
      ease: EASE_PREMIUM,
    },
  }),
};

export const megaMenuItemStagger: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.28,
      ease: EASE_PREMIUM,
    },
  }),
};

export const megaMenuImageStagger: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 + i * 0.03,
      duration: 0.28,
      ease: EASE_PREMIUM,
    },
  }),
};

export const heroTextStagger: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.4 + i * 0.08,
      duration: 0.7,
      ease: EASE_PREMIUM,
    },
  }),
};

export const categoryMosaicStagger: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.7,
      ease: EASE_PREMIUM,
    },
  }),
};

export const productGridStagger: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.6,
      ease: EASE_PREMIUM,
    },
  }),
};

export const drawerBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

export const searchOverlayPanel: Variants = {
  hidden: { opacity: 0, y: -30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: EASE_PREMIUM },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: { duration: 0.3, ease: EASE_PREMIUM },
  },
};

export const searchResultStagger: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.3,
      ease: EASE_PREMIUM,
    },
  }),
};

export const wishlistHeart: Variants = {
  initial: { scale: 1 },
  animate: { scale: 1 },
  hover: { scale: 1.2, transition: { duration: 0.2, ease: EASE_PREMIUM } },
  tap: { scale: 0.9 },
};

export const wishlistHeartActive: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.2, ease: EASE_PREMIUM } },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.15, ease: EASE_PREMIUM } },
};

export const quickAddSlide: Variants = {
  hidden: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    transition: { duration: 0.3, ease: EASE_PREMIUM },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    marginBottom: 0,
    transition: { duration: 0.25, ease: EASE_PREMIUM },
  },
};

export const mobileDrawer: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { duration: 0.4, ease: EASE_PREMIUM },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.35, ease: EASE_PREMIUM },
  },
};

export const accordionItem: Variants = {
  closed: { height: 0, opacity: 0 },
  open: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3, ease: EASE_PREMIUM },
  },
};

export const reducedMotionVariants = {
  fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.01 } } },
  fadeUp: { hidden: { opacity: 0, y: 0 }, visible: { opacity: 1, y: 0, transition: { duration: 0.01 } } },
  scaleReveal: { hidden: { opacity: 0, scale: 1 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.01 } } },
  imageReveal: { hidden: { opacity: 0, scale: 1 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.01 } } },
  clipReveal: { hidden: { clipPath: 'inset(0 0 0% 0)' }, visible: { clipPath: 'inset(0 0 0% 0)', transition: { duration: 0.01 } } },
  slideInRight: { hidden: { x: 0 }, visible: { x: 0, transition: { duration: 0.01 } } },
  slideInBottom: { hidden: { y: 0 }, visible: { y: 0, transition: { duration: 0.01 } } },
  menuReveal: { hidden: { opacity: 0, y: 0 }, visible: { opacity: 1, y: 0, transition: { duration: 0.01 } } },
  staggerContainer: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0 } } },
  staggerItem: { hidden: { opacity: 0, y: 0 }, visible: { opacity: 1, y: 0, transition: { duration: 0.01 } } },
  pageTransition: { hidden: { opacity: 0, y: 0 }, visible: { opacity: 1, y: 0, transition: { duration: 0.01 } } },
  headerEntrance: { hidden: { opacity: 0, scale: 1 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.01 } } },
  mobileDrawer: { hidden: { x: 0 }, visible: { x: 0, transition: { duration: 0.01 } } },
};