/**
 * Font set for the store: Inter Tight for headlines, Inter for text,
 * Instrument Serif (italic) for accent words, JetBrains Mono for panel-style labels.
 */
import { Inter, Inter_Tight, Instrument_Serif, JetBrains_Mono } from 'next/font/google';

export const display = Inter_Tight({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display' });
export const body = Inter({ subsets: ['latin'], variable: '--font-body' });
export const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif' });
export const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });
