/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // HEADERR system — legacy names remapped to new palette
        navy: 'hsl(var(--navy))',
        deep_blue: 'hsl(var(--deep-blue))',
        olive: 'hsl(var(--olive))',
        sage: 'hsl(var(--sage))',
        green: 'hsl(var(--green))',
        gold: 'hsl(var(--gold))',
        bronze: 'hsl(var(--bronze))',
        amber: 'hsl(var(--amber))',
        red: 'hsl(var(--red))',
        blood_red: 'hsl(var(--red))',
        off_white: 'hsl(var(--off-white))',
        charcoal: 'hsl(var(--charcoal))',
        chrome: 'hsl(var(--chrome))',
      },
      fontFamily: {
        display: ["'Instrument Serif'", 'Georgia', 'serif'],
        sans: ["'Suisse Intl'", "'Helvetica Neue'", 'Helvetica', 'Arial', 'sans-serif'],
        mono: ["'ABC Monument Grotesk Mono'", 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
        full: '9999px',
      },
      transitionDuration: {
        micro: '150ms',
        ui: '250ms',
        component: '400ms',
        editorial: '700ms',
        hero: '1400ms',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
        ease_out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'image-zoom': {
          '0%': { opacity: '0', transform: 'scale(1.06)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
        'image-zoom': 'image-zoom 1.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'marquee': 'marquee 24s linear infinite',
      },
    },
  },
  plugins: [],
};