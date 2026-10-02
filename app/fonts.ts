/**
 * Display + body font pair for the active design preset. Keep exactly one
 * pair uncommented: every declared font ships CSS. Pairs per preset:
 *
 *   pastel   Fredoka + Nunito            (playful, rounded)
 *   bold     Anton + Inter               (loud, condensed, editorial)
 *   clinical Manrope + Inter             (calm, precise)
 *   natural  Fraunces + Work_Sans        (warm, crafted)
 *   dark     Space_Grotesk + Inter       (technical)
 *
 * Apply with: <div className={`${display.variable} ${body.variable} font-body`}>
 */
import { Space_Grotesk, Inter } from 'next/font/google';

export const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display' });
export const body = Inter({ subsets: ['latin'], variable: '--font-body' });

// bold:
// import { Anton, Inter } from 'next/font/google';
// export const display = Anton({ subsets: ['latin'], weight: '400', variable: '--font-display' });
// export const body = Inter({ subsets: ['latin'], variable: '--font-body' });
//
// clinical:
// import { Manrope, Inter } from 'next/font/google';
// export const display = Manrope({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-display' });
// export const body = Inter({ subsets: ['latin'], variable: '--font-body' });
//
// natural:
// import { Fraunces, Work_Sans } from 'next/font/google';
// export const display = Fraunces({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-display' });
// export const body = Work_Sans({ subsets: ['latin'], variable: '--font-body' });
//
// pastel:
// import { Fredoka, Nunito } from 'next/font/google';
// export const display = Fredoka({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display' });
// export const body = Nunito({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-body' });
