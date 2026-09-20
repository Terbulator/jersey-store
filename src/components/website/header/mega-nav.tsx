'use client';

import { useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { MENUS, NAV_ITEMS, type MenuId } from '@/data/menu-data';

interface MegaNavProps {
  active: MenuId;
  onEnter: (id: MenuId) => void;
  onLeave: () => void;
}

const PANEL_VARIANTS = {
  hidden: { opacity: 0, y: -4, scaleY: 0.98 },
  visible: { opacity: 1, y: 0, scaleY: 1 },
  exit: { opacity: 0, y: -4, scaleY: 0.98 },
};

export function MegaNav({ active, onEnter, onLeave }: MegaNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNavEnter = useCallback(
    (id: MenuId) => {
      if (leaveTimer.current) {
        clearTimeout(leaveTimer.current);
        leaveTimer.current = null;
      }
      onEnter(id);
    },
    [onEnter]
  );

  const handleNavLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => {
      onLeave();
    }, 80);
  }, [onLeave]);

  const handlePanelEnter = useCallback(() => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);

  const handlePanelLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => {
      onLeave();
    }, 80);
  }, [onLeave]);

  useEffect(() => {
    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  const data = active ? MENUS[active] : null;

  return (
    <>
      {/* Desktop nav triggers */}
      <nav className="hidden lg:flex items-center gap-7 xl:gap-8">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onMouseEnter={() => handleNavEnter(item.id)}
            onMouseLeave={handleNavLeave}
            className="relative py-1"
          >
            <span
              className={`text-[11px] tracking-[0.15em] uppercase font-medium transition-colors duration-200 ${
                active === item.id ? 'text-blood-red' : 'text-charcoal hover:text-blood-red'
              }`}
            >
              {item.label}
            </span>
            <span
              className={`absolute bottom-0 left-0 right-0 h-[1px] bg-blood-red origin-left transition-transform duration-300 ${
                active === item.id ? 'scale-x-100' : 'scale-x-0'
              }`}
            />
          </button>
        ))}
      </nav>

      {/* Mega menu panel */}
      <AnimatePresence>
        {active && data && (
          <motion.div
            ref={panelRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={PANEL_VARIANTS}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ transformOrigin: 'top' }}
            onMouseEnter={handlePanelEnter}
            onMouseLeave={handlePanelLeave}
            className="fixed top-[72px] left-0 right-0 z-40 bg-off-white border-b border-charcoal/8 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)]"
          >
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-10 lg:py-12">
              <div className="grid grid-cols-[1fr_320px] gap-12 lg:gap-16">
                {/* Links area */}
                <div className="grid grid-cols-3 gap-8">
                  {data.sections.map((section, sIdx) => (
                    <div key={section.title}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={active + section.title}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ delay: sIdx * 0.04, duration: 0.3 }}
                        >
                          <h4 className="text-[10px] tracking-[0.2em] uppercase text-chrome mb-4 font-medium">
                            {section.title}
                          </h4>
                          <ul className="space-y-2.5">
                            {section.items.map((link, lIdx) => (
                              <motion.li
                                key={link.label}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay: sIdx * 0.04 + lIdx * 0.025,
                                  duration: 0.3,
                                }}
                              >
                                <Link
                                  href={link.href}
                                  className="block text-sm text-charcoal/70 hover:text-blood-red transition-colors duration-200"
                                >
                                  {link.label}
                                </Link>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Featured image */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    className="relative overflow-hidden hidden lg:block"
                  >
                    <img
                      src={data.image}
                      alt={data.imageAlt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <Link
                        href={data.cta.href}
                        className="inline-flex items-center gap-2 text-off-white text-[11px] tracking-[0.15em] uppercase font-medium hover:gap-3 transition-all duration-300"
                      >
                        {data.cta.label}
                        <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
