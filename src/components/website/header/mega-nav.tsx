'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MENUS, NAV_Items, type MenuId } from '@/data/menu-data';

interface MegaNavProps {
  active: MenuId;
  onEnter: (id: MenuId) => void;
  onLeave: () => void;
}

const EASE = [0.25, 0.1, 0.25, 1] as const;

export function MegaNav({
  active,
  onEnter,
  onLeave,
}: MegaNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [panelHovered, setPanelHovered] = useState(false);

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
    }, 180);
  }, [onLeave]);

  const handlePanelEnter = useCallback(() => {
    setPanelHovered(true);
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);

  const handlePanelLeave = useCallback(() => {
    setPanelHovered(false);
    leaveTimer.current = setTimeout(() => {
      onLeave();
    }, 180);
  }, [onLeave]);

  useEffect(() => {
    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  const data = active ? MENUS[active] : null;

  return (
    <>
      <nav className="hidden lg:flex items-center gap-7 xl:gap-8" role="menubar">
        {NAV_Items.map((item) => {
          const isHoverActive = active === item.id;
          return (
            <button
              key={item.id}
              onMouseEnter={() => handleNavEnter(item.id)}
              onMouseLeave={handleNavLeave}
              onClick={() => window.location.href = item.href}
              className="relative py-1.5 group"
              role="menuitem"
              aria-expanded={isHoverActive}
              aria-haspopup="dialog"
              aria-controls={isHoverActive ? `mega-menu-${item.id}` : undefined}
            >
              <span
                className={`text-[11px] tracking-[0.15em] uppercase font-medium transition-colors duration-200 ${
                  isHoverActive ? 'text-blood-red' : 'text-charcoal hover:text-blood-red'
                }`}
              >
                {item.label}
              </span>
              <motion.span
                className="absolute bottom-0 left-0 right-0 h-[1px] bg-blood-red origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isHoverActive ? 1 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              />
            </button>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        {active && data && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE }}
            onMouseEnter={handlePanelEnter}
            onMouseLeave={handlePanelLeave}
            id={`mega-menu-${active}`}
            role="dialog"
            aria-label={`${data.tagline} navigation`}
            className="fixed top-[72px] left-0 right-0 z-40 bg-off-white border-b border-charcoal/8 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.12)]"
          >
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-8 lg:py-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Left: Navigation columns */}
                <div className="grid grid-cols-3 gap-8 lg:gap-10 lg:col-span-2">
                  {data.sections.map((section, sIdx) => (
                    <div key={section.title}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={active + section.title}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ delay: sIdx * 0.03, duration: 0.28, ease: EASE }}
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
                                  delay: sIdx * 0.03 + lIdx * 0.025,
                                  duration: 0.28,
                                  ease: EASE,
                                }}
                              >
                                <Link
                                  href={link.href}
                                  className="block text-[13px] text-charcoal/70 hover:text-blood-red transition-colors duration-200 leading-relaxed"
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

                {/* Right: 3 Image Cards */}
                <div className="hidden lg:block">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="grid grid-cols-1 gap-4"
                    >
                      {data.imageCards.map((card, cIdx) => (
                        <motion.div
                          key={card.title}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ delay: cIdx * 0.04, duration: 0.3, ease: EASE }}
                          className="relative overflow-hidden group cursor-pointer rounded-lg"
                        >
                          <Link
                            href={card.cta.href}
                            className="block h-[180px] sm:h-[200px] lg:h-[220px]"
                          >
                            <img
                              src={card.image}
                              alt={card.imageAlt}
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                              loading="lazy"
                            />
                          </Link>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-400" />
                          <div className="absolute bottom-0 left-0 right-0 p-5">
                            <p className="text-white/50 text-[8px] tracking-[0.25em] uppercase font-medium mb-1.5">
                              {card.eyebrow}
                            </p>
                            <p className="text-white font-semibold text-[14px] sm:text-[15px] lg:text-[16px] leading-tight mb-3">
                              {card.title}
                            </p>
                            <Link
                              href={card.cta.href}
                              className="inline-flex items-center gap-1.5 text-off-white text-[10px] tracking-[0.15em] uppercase font-medium hover:gap-2.5 transition-all duration-200"
                            >
                              {card.cta.label}
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* CTA */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ delay: 0.25, duration: 0.3, ease: EASE }}
                  className="mt-8 lg:mt-10 pt-6 lg:pt-8 border-t border-charcoal/8"
                >
                  <Link
                    href={data.cta.href}
                    className="inline-flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-blood-red font-medium hover:gap-3 transition-all duration-200"
                  >
                    {data.cta.label}
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}