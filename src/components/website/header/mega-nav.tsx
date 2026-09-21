'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { MENUS, NAV_ITEMS, type MenuId } from '@/data/menu-data';

interface MegaNavProps {
  active: MenuId;
  canvasActive: MenuId;
  onEnter: (id: MenuId) => void;
  onLeave: () => void;
  onClickSection: (id: MenuId) => void;
  navColor: any;
  isAtTop: boolean;
}

const EASE = [0.25, 0.1, 0.25, 1] as const;

export function MegaNav({
  active,
  canvasActive,
  onEnter,
  onLeave,
  onClickSection,
  navColor,
  isAtTop,
}: MegaNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [panelHovered, setPanelHovered] = useState(false);
  const [activeSection, setActiveSection] = useState<MenuId>(null);

  const handleNavEnter = useCallback(
    (id: MenuId) => {
      if (leaveTimer.current) {
        clearTimeout(leaveTimer.current);
        leaveTimer.current = null;
      }
      if (!canvasActive) {
        onEnter(id);
        setActiveSection(id);
      }
    },
    [onEnter, canvasActive]
  );

  const handleNavLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => {
      onLeave();
      setActiveSection(null);
    }, 150);
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
      setActiveSection(null);
    }, 150);
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
      <nav className="hidden lg:flex items-center gap-7 xl:gap-8" role="menubar">
        {NAV_ITEMS.map((item) => {
          const isHoverActive = active === item.id;
          const isCanvasActive = canvasActive === item.id;
          const isCurrentSection = activeSection === item.id;
          return (
            <button
              key={item.id}
              onMouseEnter={() => handleNavEnter(item.id)}
              onMouseLeave={handleNavLeave}
              onClick={() => onClickSection(item.id)}
              className="relative py-1.5 group"
              role="menuitem"
              aria-expanded={isCanvasActive}
              aria-haspopup="dialog"
              aria-controls={isHoverActive ? `mega-menu-${item.id}` : undefined}
            >
              <span
                className={`text-[11px] tracking-[0.15em] uppercase font-medium transition-colors duration-200 ${
                  isCanvasActive
                    ? 'text-blood-red'
                    : isHoverActive || isCurrentSection
                    ? isAtTop
                      ? 'text-off-white'
                      : 'text-blood-red'
                    : isAtTop
                    ? 'text-off-white/90 hover:text-off-white'
                    : 'text-charcoal hover:text-blood-red'
                }`}
              >
                {item.label}
              </span>
              <motion.span
                className="absolute bottom-0 left-0 right-0 h-[1px] bg-blood-red origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isHoverActive || isCanvasActive || isCurrentSection ? 1 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              />
            </button>
          );
        })}
      </nav>

      {/* Hover mega menu panel */}
      <AnimatePresence>
        {active && data && !canvasActive && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            onMouseEnter={handlePanelEnter}
            onMouseLeave={handlePanelLeave}
            id={`mega-menu-${active}`}
            role="dialog"
            aria-label={`${data.tagline} navigation`}
            className="fixed top-[72px] left-0 right-0 z-40 bg-off-white border-b border-charcoal/8 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.16)]"
          >
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
              <div className="grid grid-cols-[1fr_420px] gap-12 lg:gap-20">
                {/* Left: editorial link columns */}
                <div className="grid grid-cols-3 gap-10 lg:gap-14">
                  {data.sections.map((section, sIdx) => (
                    <div key={section.title}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={active + section.title}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ delay: sIdx * 0.04, duration: 0.35, ease: EASE }}
                        >
                          <h4 className="text-[10px] tracking-[0.22em] uppercase text-chrome mb-6 font-medium">
                            {section.title}
                          </h4>
                          <ul className="space-y-3.5">
                            {section.items.map((link, lIdx) => (
                              <motion.li
                                key={link.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay: sIdx * 0.04 + lIdx * 0.03,
                                  duration: 0.35,
                                  ease: EASE,
                                }}
                              >
                                <Link
                                  href={link.href}
                                  className="block text-[14px] text-charcoal/70 hover:text-blood-red transition-colors duration-200 leading-relaxed"
                                >
                                  {link.label}
                                </Link>
                              </motion.li>
                            ))}
                          </ul>

                          {sIdx === 0 && (
                            <motion.button
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3, duration: 0.3 }}
                              onClick={() => onClickSection(active)}
                              className="mt-8 flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase text-blood-red font-medium hover:gap-3 transition-all duration-300 group"
                            >
                              View full collection
                              <ArrowRight
                                className="w-2.5 h-2.5 transition-transform duration-200 group-hover:translate-x-0.5"
                                strokeWidth={2}
                              />
                            </motion.button>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Right: large editorial image */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="relative overflow-hidden hidden lg:block cursor-pointer group"
                    onClick={() => onClickSection(active)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onClickSection(active)}
                    aria-label={`View full ${active} collection`}
                  >
                    <img
                      src={data.image}
                      alt={data.imageAlt}
                      className="w-full h-[480px] lg:h-[520px] object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <p className="text-white/40 text-[9px] tracking-[0.3em] uppercase font-medium mb-3">
                        {data.tagline}
                      </p>
                      <Link
                        href={data.cta.href}
                        className="inline-flex items-center gap-2.5 text-off-white text-[11px] tracking-[0.18em] uppercase font-semibold hover:gap-4 transition-all duration-300"
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