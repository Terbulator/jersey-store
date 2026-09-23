'use client';

import { motion } from 'framer-motion';
import { resolveThemeColor } from '@/lib/theme';
import { useTheme } from './theme-provider';

// Per-section design overrides, stored as settings.design. Only keys the
// underlying component actually supports are applied (see SECTION_SUPPORT) —
// no fake controls. hide_on (visibility) is universal.
export interface SectionDesign {
  bg?: string;
  heading_color?: string;
  body_color?: string;
  accent_color?: string;
  heading_size?: 'sm' | 'md' | 'lg';
  padding_y?: number;
  padding_y_mobile?: number;
  align?: 'left' | 'center';
  radius?: number;
  shadow?: 'none' | 'soft' | 'lift';
  animation?: 'none' | 'fade' | 'rise' | 'scale';
  animation_duration?: number;
  hide_on?: ('desktop' | 'tablet' | 'mobile')[];
}

// Design keys each section supports. bg/padding/radius are excluded where
// they would break full-bleed or sticky layouts (hero, story).
export const SECTION_SUPPORT: Record<string, string[]> = {
  hero: ['bg', 'heading_color', 'body_color', 'accent_color', 'align', 'animation', 'visibility'],
  story_slides: ['bg', 'heading_color', 'body_color', 'accent_color', 'visibility'],
  trust_strip: ['bg', 'body_color', 'accent_color', 'padding', 'visibility', 'animation'],
  category_nav: ['bg', 'heading_color', 'accent_color', 'heading_size', 'padding', 'align', 'visibility', 'animation'],
  best_sellers: ['bg', 'heading_color', 'heading_size', 'padding', 'align', 'visibility', 'animation'],
  editorial_split: ['bg', 'heading_color', 'body_color', 'heading_size', 'padding', 'align', 'radius', 'shadow', 'animation', 'visibility'],
  bundle_section: ['bg', 'heading_color', 'body_color', 'accent_color', 'heading_size', 'padding', 'align', 'radius', 'shadow', 'animation', 'visibility'],
  stats_section: ['bg', 'heading_color', 'body_color', 'padding', 'visibility', 'animation'],
  editions_section: ['bg', 'heading_color', 'body_color', 'heading_size', 'padding', 'align', 'visibility', 'animation'],
  expert_section: ['bg', 'heading_color', 'body_color', 'heading_size', 'padding', 'align', 'radius', 'shadow', 'animation', 'visibility'],
  newsletter_section: ['bg', 'heading_color', 'body_color', 'accent_color', 'heading_size', 'padding', 'align', 'radius', 'shadow', 'animation', 'visibility'],
  review_section: ['bg', 'heading_color', 'body_color', 'heading_size', 'padding', 'align', 'radius', 'shadow', 'animation', 'visibility'],
};

const SHADOWS: Record<string, string> = {
  soft: 'shadow-[0_8px_30px_rgba(0,0,0,0.35)]',
  lift: 'shadow-[0_20px_60px_rgba(0,0,0,0.5)]',
};

const HSIZE: Record<string, string> = { sm: 'sec-h-sm', md: 'sec-h-md', lg: 'sec-h-lg' };

export function SectionShell({
  design,
  support,
  children,
}: {
  design?: SectionDesign | null;
  support?: string[];
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const d: SectionDesign = {};
  if (design && typeof design === 'object') {
    for (const [k, v] of Object.entries(design)) {
      if (v !== undefined && v !== '' && (!support || support.includes(k) || k === 'hide_on')) {
        (d as Record<string, unknown>)[k] = v;
      }
    }
  }
  const hide = d.hide_on ?? [];
  const padded = d.padding_y != null || d.padding_y_mobile != null;
  const hasVisual =
    !!d.bg || !!d.heading_color || !!d.body_color || !!d.accent_color || !!d.heading_size ||
    padded || !!d.align || d.radius != null || !!d.shadow || !!d.animation;
  if (!hasVisual && hide.length === 0) return <>{children}</>;

  const cls = [
    hide.includes('mobile') ? 'max-md:hidden' : '',
    hide.includes('tablet') ? 'md:max-lg:hidden' : '',
    hide.includes('desktop') ? 'lg:hidden' : '',
    d.bg ? 'sec-bg' : '',
    padded ? 'sec-pad' : '',
    d.align === 'center' ? 'text-center' : '',
    d.heading_size ? HSIZE[d.heading_size] : '',
    d.shadow && d.shadow !== 'none' ? SHADOWS[d.shadow] : '',
  ].filter(Boolean).join(' ');

  const style = {
    background: resolveThemeColor(d.bg, theme),
    color: resolveThemeColor(d.body_color, theme),
    '--sec-heading': resolveThemeColor(d.heading_color, theme),
    '--sec-accent': resolveThemeColor(d.accent_color, theme),
    '--sec-pt': d.padding_y != null ? `${d.padding_y}px` : undefined,
    '--sec-pt-m': d.padding_y_mobile != null ? `${d.padding_y_mobile}px` : undefined,
    borderRadius: d.radius != null ? `${d.radius}px` : undefined,
    overflow: d.radius != null ? 'hidden' : undefined,
  } as React.CSSProperties;

  const anim = d.animation ?? 'none';
  const dur = d.animation_duration ?? 0.7;
  const body =
    anim === 'none' ? (
      children
    ) : (
      <motion.div
        initial={anim === 'scale' ? { opacity: 0, scale: 1.04 } : anim === 'rise' ? { opacity: 0, y: 32 } : { opacity: 0 }}
        whileInView={anim === 'scale' ? { opacity: 1, scale: 1 } : anim === 'rise' ? { opacity: 1, y: 0 } : { opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: dur }}
      >
        {children}
      </motion.div>
    );

  return (
    <div className={`sec-shell ${cls}`} style={style}>
      {body}
    </div>
  );
}
