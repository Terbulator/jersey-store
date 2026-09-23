'use client';

import { createContext, useContext } from 'react';
import { THEME_DEFAULTS, mergeTheme, themeToCss, type Theme } from '@/lib/theme';
import { DISPLAY_DEFAULTS, type DisplaySettings } from '@/lib/display';

// Theme tokens for section overrides ('token:brand.primary' resolves here).
// Defaults to the built-in palette so shells render sanely without a provider.
const ThemeCtx = createContext<Theme>(mergeTheme(null));

export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  return <ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>;
}

// Product/collection display templates (card, detail, collection). Defaults
// render exactly today's layout when no config is saved.
const TemplatesCtx = createContext<DisplaySettings>(DISPLAY_DEFAULTS);

export const useTemplates = () => useContext(TemplatesCtx);

export function TemplatesProvider({ display, children }: { display: DisplaySettings; children: React.ReactNode }) {
  return <TemplatesCtx.Provider value={display}>{children}</TemplatesCtx.Provider>;
}

// Stylesheet generated from validated tokens only (hex colors, numeric
// sizes, allowlisted font stacks) — no user markup is ever interpolated.
export function ThemeStyle({ theme }: { theme: Theme }) {
  return <style dangerouslySetInnerHTML={{ __html: themeToCss(theme) }} />;
}
