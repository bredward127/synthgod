/** Pure helpers for the arpeggiator and step sequencer (no audio, testable). */

export type ArpMode = 'up' | 'down' | 'updown' | 'random' | 'order';
export const ARP_MODES: ArpMode[] = ['up', 'down', 'updown', 'random', 'order'];
export const ARP_RATES = [
  { label: '1/4', perBeat: 1 },
  { label: '1/8', perBeat: 2 },
  { label: '1/16', perBeat: 4 },
  { label: '1/32', perBeat: 8 },
];

/**
 * The note cycle for held notes. `held` is in press order. Octaves extend the
 * pattern upward by 12 semitones each. Up/down doesn't repeat the end notes.
 */
export function arpPattern(held: number[], mode: ArpMode, octaves: number): number[] {
  if (!held.length) return [];
  const base = mode === 'order' ? [...held] : [...new Set(held)].sort((a, b) => a - b);
  const spread: number[] = [];
  for (let o = 0; o < Math.max(1, octaves); o++) for (const n of base) spread.push(n + 12 * o);
  switch (mode) {
    case 'down':
      return spread.reverse();
    case 'updown':
      return spread.length < 3 ? spread : [...spread, ...spread.slice(1, -1).reverse()];
    default:
      return spread;
  }
}

/** Seconds per step at a tempo and subdivision. */
export const stepSeconds = (bpm: number, perBeat: number) => 60 / bpm / perBeat;

export type SeqStep = number | null;
export const emptySteps = (n = 16): SeqStep[] => Array.from({ length: n }, () => null);
