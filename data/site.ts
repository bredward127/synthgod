/**
 * Brand settings shared by every section-built page. Theme is the `dark`
 * preset, recolored to the FM-1 (see app/globals.css).
 */
export type Theme = 'pastel' | 'bold' | 'clinical' | 'natural' | 'dark';

export const site = {
  brand: 'SynthGod',
  badge: 'FM-1' as string | undefined,
  theme: 'dark' as Theme,
  /** Shown in the top strip and footer. Empty string hides it. */
  disclosure: 'Buy buttons go to AliExpress and may be affiliate links: we may earn a commission at no extra cost to you.',
  /** Independence statement: this site is not the manufacturer. */
  independence: 'SynthGod is an independent site. It is not affiliated with or endorsed by M-VAVE, and orders are handled by the AliExpress seller.',
  amazonTag: '',
  footerLinks: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Disclosure', href: '/disclosure' },
  ],
};
