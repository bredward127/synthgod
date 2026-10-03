import type { Config } from 'tailwindcss';

/** Design tokens. `brand.*` colors come from CSS variables in app/globals.css. */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './data/**/*.{js,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: v('bg'),
          surface: v('surface'),
          raised: v('raised'),
          ink: v('ink'),
          muted: v('muted'),
          faint: v('faint'),
          line: v('line'),
          accent: v('accent'),
          'accent-ink': v('accent-ink'),
          accent2: v('accent2'),
          gold: v('gold'),
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: { tightest: '-0.045em' },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        'glow-pulse': { '0%,100%': { opacity: '0.55', transform: 'scale(1)' }, '50%': { opacity: '0.85', transform: 'scale(1.06)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        aurora: {
          '0%,100%': { transform: 'translate3d(0,0,0) rotate(0deg)' },
          '33%': { transform: 'translate3d(4%,-3%,0) rotate(8deg)' },
          '66%': { transform: 'translate3d(-3%,4%,0) rotate(-6deg)' },
        },
        shine: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        spin: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 6s ease-in-out infinite',
        marquee: 'marquee 38s linear infinite',
        aurora: 'aurora 22s ease-in-out infinite',
        shine: 'shine 5s linear infinite',
        'fade-up': 'fade-up 0.9s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.6s ease-out both',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'spin-slow': 'spin 9s linear infinite',
      },
      transitionTimingFunction: { lux: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    },
  },
  plugins: [],
};

export default config;
