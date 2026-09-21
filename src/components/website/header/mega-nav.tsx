'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MENUS, NAV_Items, type MenuId } from '@/data/menu-data';

interface MegaNavProps {
  active: MenuId;
  onEnter: (id: MenuId) => void;
  onLeave: () => void;
}

const EASE = [0.25, 0.1, 0.25, 1] as const;
const HOVER_INTENT_DELAY = 130;
const CROSSFADE_DURATION = 0.2;
const HOVER_BRIDGE_DELAY = 180;

export function MegaNav({
  active,
  onEnter,
  onLeave,
}: MegaNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [panelHovered, setPanelHovered] = useState(false);
  const [pendingActive, setPendingActive] = useState<MenuId>(null);
  const shouldReduceMotion = useReducedMotion();

  const clearTimers = useCallback(() => {
    if (enterTimer.current) {
      clearTimeout(enterTimer.current);
      enterTimer.current = null;
    }
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);

  const handleNavEnter = useCallback(
    (id: MenuId) => {
      clearTimers();
      if (shouldReduceMotion) {
        onEnter(id);
        return;
      }
      enterTimer.current = setTimeout(() => {
        onEnter(id);
        setPendingActive(null);
      }, HOVER_INTENT_DELAY);
      setPendingActive(id);
    },
    [onEnter, shouldReduceMotion, clearTimers]
  );

  const handleNavLeave = useCallback(() => {
    if (enterTimer.current) {
      clearTimeout(enterTimer.current);
      enterTimer.current = null;
    }
    if (shouldReduceMotion) {
      onLeave();
      return;
    }
    leaveTimer.current = setTimeout(() => {
      onLeave();
    }, HOVER_BRIDGE_DELAY);
  }, [onLeave, shouldReduceMotion]);

  const handlePanelEnter = useCallback(() => {
    setPanelHovered(true);
    clearTimers();
  }, [clearTimers]);

  const handlePanelLeave = useCallback(() => {
    setPanelHovered(false);
    if (shouldReduceMotion) {
      onLeave();
      return;
    }
    leaveTimer.current = setTimeout(() => {
      onLeave();
    }, HOVER_BRIDGE_DELAY);
  }, [onLeave, shouldReduceMotion]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const data = active ? MENUS[active] : null;
  const isTransitioning = pendingActive !== null && pendingActive !== active;

  const transitionConfig = shouldReduceMotion
    ? { duration: 0.05, ease: EASE }
    : { duration: CROSSFADE_DURATION, ease: EASE };

  return (
    <>
      <nav className="hidden lg:flex items-center gap-7 xl:gap-8" role="menubar">
        {NAV_Items.map((item) => {
          const isHoverActive = active === item.id || pendingActive === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onMouseEnter={() => handleNavEnter(item.id)}
              onMouseLeave={handleNavLeave}
              onClick={(e) => {
                e.preventDefault();
                if (!MENUS[item.id]?.sections.length) {
                  window.location.href = item.href;
                }
              }}
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
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={transitionConfig}
            onMouseEnter={handlePanelEnter}
            onMouseLeave={handlePanelLeave}
            id={`mega-menu-${active}`}
            role="dialog"
            aria-label={`${data.tagline} navigation`}
            className="fixed top-[72px] left-0 right-0 z-40 max-h-[440px] backdrop-blur-xl bg-off-white/85 border-b border-charcoal/8 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.12)]"
            style={{
              backgroundColor: 'rgba(239, 236, 230, 0.88)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-6 lg:py-8 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 h-full">
                {/* Left: Navigation columns */}
                <div className="grid grid-cols-3 gap-6 lg:gap-8 lg:col-span-2 overflow-y-auto pr-2">
                  {data.sections.map((section, sIdx) => (
                    <div key={section.title}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={active + section.title}
                          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                          transition={{
                            delay: shouldReduceMotion ? 0 : sIdx * 0.03,
                            duration: shouldReduceMotion ? 0.05 : 0.28,
                            ease: EASE,
                          }}
                        >
                          <h4 className="text-[10px] tracking-[0.2em] uppercase text-chrome mb-3 font-medium">
                            {section.title}
                          </h4>
                          <ul className="space-y-2">
                            {section.items.map((link, lIdx) => (
                              <motion.li
                                key={link.label}
                                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -6 }}
                                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                                transition={{
                                  delay: shouldReduceMotion ? 0 : sIdx * 0.03 + lIdx * 0.02,
                                  duration: shouldReduceMotion ? 0.05 : 0.25,
                                  ease: EASE,
                                }}
                              >
                                <Link
                                  href={link.href}
                                  className="block text-[13px] text-charcoal/70 hover:text-blood-red transition-colors duration-150 leading-relaxed"
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
                <div className="hidden lg:block h-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                      transition={{
                        delay: shouldReduceMotion ? 0 : 0.05,
                        duration: shouldReduceMotion ? 0.05 : 0.25,
                        ease: EASE,
                      }}
                      className="grid grid-cols-1 gap-3 h-full"
                    >
                      {data.imageCards.map((card, cIdx) => (
                        <motion.div
                          key={card.title}
                          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                          transition={{
                            delay: shouldReduceMotion ? 0 : 0.05 + cIdx * 0.03,
                            duration: shouldReduceMotion ? 0.05 : 0.28,
                            ease: EASE,
                          }}
                          className="relative overflow-hidden group cursor-pointer rounded-lg h-full min-h-0 flex flex-col"
                        >
                          <Link
                            href={card.cta.href}
                            className="flex-1 block relative overflow-hidden rounded-lg"
                          >
                            <img
                              src={card.image}
                              alt={card.imageAlt}
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                              loading="lazy"
                            />
                          </Link>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                            <p className="text-white/50 text-[8px] tracking-[0.25em] uppercase font-medium mb-1.5">
                              {card.eyebrow}
                            </p>
                            <p className="text-white font-semibold text-[13px] sm:text-[14px] lg:text-[15px] leading-tight mb-2">
                              {card.title}
                            </p>
                            <Link
                              href={card.cta.href}
                              className="inline-flex items-center gap-1.5 text-off-white text-[10px] tracking-[0.15em] uppercase font-medium hover:gap-2 transition-all duration-150"
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
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{
                    delay: shouldReduceMotion ? 0 : 0.2,
                    duration: shouldReduceMotion ? 0.05 : 0.25,
                    ease: EASE,
                  }}
                  className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-charcoal/8"
                >
                  <Link
                    href={data.cta.href}
                    className="inline-flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-blood-red font-medium hover:gap-3 transition-all duration-150"
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