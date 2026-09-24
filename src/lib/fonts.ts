import { Instrument_Serif } from 'next/font/google';

// Instrument Serif - Google Font (display/headlines)
export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400'],
});

// Note: Suisse Intl and ABC Monument Grotesk Mono are custom fonts not in the repo.
// They are defined via CSS variables in globals.css and the theme system.
// The theme system injects --font-body and --font-mono via ThemeStyle component.
// If not available, they fall back to system fonts defined in globals.css.