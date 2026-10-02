import type { Config } from 'tailwindcss';

/**
 * Design tokens.
 *
 * `brand.*` are semantic colors driven by CSS variables, so one set of section
 * components works under every preset in app/globals.css (pastel, bold,
 * clinical, natural, dark). Pick a preset with data-theme on the page wrapper.
 *
 * The named palettes (cream, mint, lavender, peach, sky, plum) are used
 * directly by the quiz-funnel archetype.
 *
 * Merging into an existing config: copy colors, fontFamily, keyframes and
 * animation into theme.extend, and keep `./data` in `content`.
 */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './data/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: v('bg'),
          surface: v('surface'),
          ink: v('ink'),
          muted: v('muted'),
          line: v('line'),
          accent: v('accent'),
          'accent-ink': v('accent-ink'),
          accent2: v('accent2'),
          band: v('band'),
          'band-ink': v('band-ink'),
        },
        cream: { DEFAULT: '#FFF8EE', 50: '#FFFCF7', 200: '#FBF0DF', 300: '#F1E2CB' },
        mint: { 100: '#E9F8F1', 200: '#CFEFE0', 400: '#86D3B2', 600: '#2E8F6C', 700: '#226E53' },
        lavender: { 100: '#F4F0FE', 200: '#E5DCFB', 400: '#B7A2F1', 600: '#7757D6', 700: '#5B3FB4' },
        peach: { 100: '#FFF1E9', 200: '#FFDCCB', 500: '#EE8A63' },
        sky: { 100: '#EDF5FF', 200: '#D4E7FF', 500: '#4F8FE0' },
        plum: { DEFAULT: '#241B35', muted: '#6E6480' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-rounded', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        squish: {
          '0%, 100%': { transform: 'scale(1, 1)' },
          '40%': { transform: 'scale(1.18, 0.82)' },
          '70%': { transform: 'scale(0.94, 1.06)' },
        },
      },
      animation: {
        'rise-in': 'rise-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        squish: 'squish 1.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
