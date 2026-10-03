/**
 * Virtual FM-1: patch format, algorithms and the demo preset bank.
 *
 * The demo bank holds 26 patches (about 20% of the FM-1's 128). They are our
 * own sounds written in the FM-1's style, not M-VAVE's factory data.
 */

export type Wave = 'sine' | 'triangle' | 'square' | 'sawtooth';

/** One FM operator. Times in seconds, sustain 0..1, level 0..99. */
export type Op = { ratio: number; fine: number; level: number; wave: Wave; a: number; d: number; s: number; r: number };

export type FilterType = 'lowpass' | 'highpass' | 'bandpass';
export type FxState = {
  filter: { on: boolean; type: FilterType; cutoff: number; reso: number };
  reverb: { on: boolean; size: number; damp: number; mix: number };
  delay: { on: boolean; time: number; feedback: number; tone: number; mix: number };
  distortion: { on: boolean; drive: number; tone: number; mix: number };
  chorus: { on: boolean; rate: number; depth: number; mix: number };
  phaser: { on: boolean; rate: number; depth: number; feedback: number; mix: number };
};
export type FxId = keyof FxState;
export const FX_ORDER: FxId[] = ['filter', 'reverb', 'delay', 'distortion', 'chorus', 'phaser'];

export type LfoTarget = 'pitch' | 'amp' | 'filter';
export type Lfo = { wave: Wave; rate: number; depth: number; target: LfoTarget };

export type Patch = {
  name: string;
  algorithm: number;
  ops: Op[];
  fx: FxState;
  lfo: Lfo;
  glide: number;
  mono: boolean;
  volume: number;
};

/** Ops are numbered 1..6. `mods` are [modulator, target] edges; `carriers` reach the output. */
export type Algorithm = { name: string; carriers: number[]; mods: Array<[number, number]> };

export const ALGORITHMS: Algorithm[] = [
  { name: 'Stack', carriers: [1], mods: [[2, 1], [3, 2], [4, 3], [5, 4], [6, 5]] },
  { name: 'Two stacks', carriers: [1, 4], mods: [[2, 1], [3, 2], [5, 4], [6, 5]] },
  { name: 'Three pairs', carriers: [1, 3, 5], mods: [[2, 1], [4, 3], [6, 5]] },
  { name: 'Branch', carriers: [1, 4], mods: [[2, 1], [3, 1], [5, 4], [6, 4]] },
  { name: 'Keys', carriers: [1, 3], mods: [[2, 1], [4, 3], [5, 3], [6, 5]] },
  { name: 'Fan out', carriers: [1, 2, 3, 4, 5], mods: [[6, 1], [6, 2], [6, 3], [6, 4], [6, 5]] },
  { name: 'Additive', carriers: [1, 2, 3, 4, 5, 6], mods: [] },
  { name: 'Wide', carriers: [1, 5], mods: [[2, 1], [3, 2], [4, 1], [6, 5]] },
];

export const isCarrier = (alg: number, opIndex: number) => ALGORITHMS[alg - 1].carriers.includes(opIndex + 1);

const op = (ratio: number, level: number, a: number, d: number, s: number, r: number, fine = 0, wave: Wave = 'sine'): Op => ({ ratio, fine, level, wave, a, d, s, r });
const OFF = op(1, 0, 0.01, 0.5, 0, 0.3);

export const defaultFx = (): FxState => ({
  filter: { on: false, type: 'lowpass', cutoff: 8000, reso: 0.7 },
  reverb: { on: false, size: 0.45, damp: 0.5, mix: 0.25 },
  delay: { on: false, time: 0.32, feedback: 0.35, tone: 0.6, mix: 0.25 },
  distortion: { on: false, drive: 0.4, tone: 0.6, mix: 0.5 },
  chorus: { on: false, rate: 0.7, depth: 0.5, mix: 0.4 },
  phaser: { on: false, rate: 0.4, depth: 0.6, feedback: 0.4, mix: 0.5 },
});

type FxPatch = { [K in FxId]?: Partial<FxState[K]> };
const fx = (p: FxPatch = {}): FxState => {
  const base = defaultFx();
  for (const id of FX_ORDER) if (p[id]) Object.assign(base[id], { on: true }, p[id]);
  return base;
};
const lfo = (target: LfoTarget = 'pitch', depth = 0, rate = 5, wave: Wave = 'sine'): Lfo => ({ wave, rate, depth, target });

const P = (name: string, algorithm: number, ops: Op[], extra: Partial<Patch> = {}): Patch => ({
  name,
  algorithm,
  ops,
  fx: fx(),
  lfo: lfo(),
  glide: 0,
  mono: false,
  volume: 0.8,
  ...extra,
});

export const PRESETS: Patch[] = [
  P('E.PIANO 1', 3, [op(1, 99, 0.002, 2.6, 0, 0.45), op(1, 52, 0.002, 1.3, 0.05, 0.3), op(1, 86, 0.002, 2.2, 0, 0.45, 6), op(14, 24, 0.001, 0.25, 0, 0.1), op(1, 70, 0.002, 2.4, 0, 0.45, -6), op(1, 44, 0.002, 1, 0, 0.3)], { fx: fx({ chorus: { mix: 0.35 }, reverb: { mix: 0.18 } }) }),
  P('E.PIANO 2', 3, [op(1, 99, 0.002, 2.2, 0, 0.4), op(1, 68, 0.002, 0.9, 0.08, 0.3), op(1, 82, 0.002, 2, 0, 0.4, 4), op(13, 34, 0.001, 0.2, 0, 0.1), op(1, 0, 0.01, 1, 0, 0.3), op(1, 0, 0.01, 1, 0, 0.3)], { fx: fx({ delay: { time: 0.28, mix: 0.18 }, reverb: { mix: 0.2 } }) }),
  P('TINE KEYS', 5, [op(1, 99, 0.002, 3, 0, 0.6), op(1, 40, 0.002, 1.5, 0, 0.4), op(1, 80, 0.002, 2.6, 0, 0.6), op(17, 30, 0.001, 0.18, 0, 0.1), op(1, 50, 0.002, 1.2, 0, 0.3), op(3, 25, 0.002, 0.6, 0, 0.2)], { fx: fx({ phaser: { rate: 0.25, mix: 0.3 }, reverb: { mix: 0.22 } }) }),
  P('GLASS BELL', 3, [op(1, 95, 0.001, 4.5, 0, 2), op(3.5, 62, 0.001, 3, 0, 1.5), op(2, 70, 0.001, 3.5, 0, 1.8, 7), op(7.1, 40, 0.001, 2, 0, 1), op(1, 0, 0.01, 1, 0, 0.3), op(1, 0, 0.01, 1, 0, 0.3)], { fx: fx({ reverb: { size: 0.8, mix: 0.38 } }) }),
  P('TUBULAR', 2, [op(1, 96, 0.001, 5, 0, 2.5), op(3.5, 58, 0.001, 4, 0, 2), op(1, 30, 0.001, 2, 0, 1), op(2.76, 80, 0.001, 4.5, 0, 2.5), op(5.4, 45, 0.001, 3, 0, 1.5), op(1, 0, 0.01, 1, 0, 0.3)], { fx: fx({ reverb: { size: 0.85, mix: 0.4 } }) }),
  P('MARIMBA', 3, [op(1, 99, 0.001, 0.55, 0, 0.25), op(4, 50, 0.001, 0.12, 0, 0.1), op(3, 50, 0.001, 0.3, 0, 0.15), op(1, 30, 0.001, 0.08, 0, 0.05), op(1, 0, 0.01, 1, 0, 0.3), op(1, 0, 0.01, 1, 0, 0.3)], { fx: fx({ reverb: { mix: 0.22 } }) }),
  P('WOOD GONG', 4, [op(1, 99, 0.001, 1.4, 0, 0.8), op(1.41, 60, 0.001, 0.6, 0, 0.4), op(2.23, 45, 0.001, 0.4, 0, 0.3), op(0.5, 60, 0.001, 1.8, 0, 1), op(1.73, 50, 0.001, 0.9, 0, 0.5), op(1, 0, 0.01, 1, 0, 0.3)], { fx: fx({ reverb: { size: 0.7, mix: 0.35 } }) }),
  P('KALIMBA', 3, [op(1, 99, 0.001, 1.2, 0, 0.5), op(6, 42, 0.001, 0.15, 0, 0.1), op(2, 40, 0.001, 0.6, 0, 0.3), op(1, 20, 0.001, 0.2, 0, 0.1), op(1, 0, 0.01, 1, 0, 0.3), op(1, 0, 0.01, 1, 0, 0.3)], { fx: fx({ delay: { time: 0.24, feedback: 0.3, mix: 0.2 }, reverb: { mix: 0.2 } }) }),
  P('SOLID BASS', 2, [op(0.5, 99, 0.002, 0.9, 0.55, 0.12), op(0.5, 70, 0.002, 0.45, 0.25, 0.1), op(1, 35, 0.002, 0.2, 0.1, 0.1), op(1, 55, 0.002, 0.6, 0.4, 0.12), op(1, 55, 0.002, 0.3, 0.2, 0.1), op(1, 0, 0.01, 1, 0, 0.3)], { mono: true, glide: 0.04, fx: fx({ filter: { cutoff: 2600, reso: 1.2 } }) }),
  P('SLAP BASS', 3, [op(0.5, 99, 0.001, 1, 0.3, 0.1), op(1.5, 78, 0.001, 0.14, 0.05, 0.08), op(1, 60, 0.001, 0.5, 0.2, 0.1), op(3, 50, 0.001, 0.08, 0, 0.05), op(1, 0, 0.01, 1, 0, 0.3), op(1, 0, 0.01, 1, 0, 0.3)], { mono: true, fx: fx({ distortion: { drive: 0.2, mix: 0.25 } }) }),
  P('SUB BASS', 7, [op(0.5, 99, 0.004, 1, 0.9, 0.15), op(1, 38, 0.004, 1, 0.8, 0.15), OFF, OFF, OFF, OFF], { mono: true, glide: 0.06 }),
  P('SYNC LEAD', 1, [op(1, 99, 0.005, 0.5, 0.85, 0.2), op(2, 70, 0.005, 0.8, 0.6, 0.2), op(1, 50, 0.005, 1, 0.5, 0.2, 0, 'sawtooth'), op(1, 0, 0.01, 1, 0, 0.3), OFF, OFF], { mono: true, glide: 0.08, lfo: lfo('pitch', 0.12, 5.5), fx: fx({ delay: { time: 0.375, feedback: 0.4, mix: 0.22 } }) }),
  P('BRASS 1', 4, [op(1, 99, 0.07, 0.5, 0.82, 0.2), op(1, 64, 0.12, 0.6, 0.7, 0.2), op(2, 30, 0.1, 0.5, 0.4, 0.2), op(1, 80, 0.06, 0.5, 0.8, 0.2, 5), op(1, 60, 0.1, 0.6, 0.6, 0.2), op(1, 0, 0.01, 1, 0, 0.3)], { fx: fx({ chorus: { mix: 0.25 }, reverb: { mix: 0.18 } }) }),
  P('BRASS PAD', 4, [op(1, 95, 0.35, 1, 0.85, 0.8), op(1, 55, 0.5, 1, 0.6, 0.8), op(3, 18, 0.5, 1, 0.3, 0.8), op(1, 80, 0.4, 1, 0.85, 0.8, -6), op(1, 52, 0.5, 1, 0.6, 0.8), op(1, 0, 0.01, 1, 0, 0.3)], { fx: fx({ chorus: { mix: 0.4 }, reverb: { size: 0.7, mix: 0.32 } }) }),
  P('STRINGS', 8, [op(1, 90, 0.45, 1, 0.9, 1.1), op(1, 36, 0.5, 1, 0.7, 1), op(2, 18, 0.5, 1, 0.5, 1), op(3, 14, 0.5, 1, 0.6, 1), op(1, 85, 0.5, 1, 0.9, 1.1, 9), op(1, 32, 0.5, 1, 0.7, 1)], { lfo: lfo('pitch', 0.06, 5), fx: fx({ chorus: { depth: 0.7, mix: 0.5 }, reverb: { size: 0.75, mix: 0.35 } }) }),
  P('WARM PAD', 3, [op(1, 92, 0.8, 1, 0.9, 1.6, 0, 'triangle'), op(1, 30, 1, 1, 0.6, 1.5), op(0.5, 70, 0.9, 1, 0.9, 1.6, 4, 'triangle'), op(1, 22, 1, 1, 0.6, 1.5), op(2, 50, 1, 1, 0.8, 1.6, -4), op(1, 18, 1, 1, 0.5, 1.5)], { fx: fx({ filter: { cutoff: 3200, reso: 0.8 }, chorus: { mix: 0.45 }, reverb: { size: 0.8, mix: 0.4 } }) }),
  P('GLASS PAD', 3, [op(1, 90, 0.6, 1.5, 0.8, 2), op(3, 34, 0.8, 2, 0.4, 2), op(2, 70, 0.7, 1.5, 0.8, 2, 7), op(5, 26, 0.8, 2, 0.3, 2), op(1, 0, 0.01, 1, 0, 0.3), op(1, 0, 0.01, 1, 0, 0.3)], { fx: fx({ delay: { time: 0.42, feedback: 0.45, mix: 0.25 }, reverb: { size: 0.9, mix: 0.45 } }) }),
  P('ORGAN 1', 7, [op(0.5, 85, 0.005, 0.1, 1, 0.06), op(1, 90, 0.005, 0.1, 1, 0.06), op(2, 70, 0.005, 0.1, 1, 0.06), op(3, 55, 0.005, 0.1, 1, 0.06), op(4, 45, 0.005, 0.1, 1, 0.06), op(6, 30, 0.005, 0.1, 1, 0.06)], { lfo: lfo('amp', 0.18, 6.2), fx: fx({ chorus: { rate: 5.5, depth: 0.3, mix: 0.35 }, reverb: { mix: 0.18 } }) }),
  P('PERC ORGAN', 5, [op(1, 92, 0.004, 0.1, 1, 0.06), op(2, 30, 0.003, 0.25, 0, 0.05), op(2, 72, 0.004, 0.1, 1, 0.06), op(3, 40, 0.003, 0.3, 0, 0.05), op(4, 20, 0.003, 0.2, 0, 0.05), op(1, 0, 0.01, 1, 0, 0.3)], { fx: fx({ chorus: { rate: 6, depth: 0.3, mix: 0.3 }, reverb: { mix: 0.2 } }) }),
  P('HARPSICH', 3, [op(1, 99, 0.001, 1.6, 0, 0.3), op(5, 56, 0.001, 0.9, 0, 0.2), op(2, 70, 0.001, 1.4, 0, 0.3, 3), op(9, 44, 0.001, 0.6, 0, 0.2), op(4, 40, 0.001, 1.1, 0, 0.3), op(1, 20, 0.001, 0.4, 0, 0.2)], { fx: fx({ reverb: { mix: 0.24 } }) }),
  P('CLAV', 3, [op(1, 99, 0.001, 0.8, 0.2, 0.08), op(1, 76, 0.001, 0.3, 0.1, 0.05), op(3, 60, 0.001, 0.6, 0.15, 0.08), op(3, 50, 0.001, 0.2, 0, 0.05), op(1, 0, 0.01, 1, 0, 0.3), op(1, 0, 0.01, 1, 0, 0.3)], { fx: fx({ phaser: { rate: 0.6, mix: 0.45 } }) }),
  P('PLUCK', 2, [op(1, 99, 0.001, 0.5, 0, 0.2), op(2, 64, 0.001, 0.15, 0, 0.1), op(1, 30, 0.001, 0.1, 0, 0.05), op(0.5, 70, 0.001, 0.6, 0, 0.2), op(1, 50, 0.001, 0.2, 0, 0.1), op(1, 0, 0.01, 1, 0, 0.3)], { fx: fx({ delay: { time: 0.3, feedback: 0.45, mix: 0.3 }, reverb: { mix: 0.2 } }) }),
  P('FLUTE', 3, [op(1, 96, 0.09, 0.4, 0.9, 0.2), op(1, 22, 0.05, 0.3, 0.4, 0.2), op(2, 25, 0.08, 0.4, 0.8, 0.2), op(1, 10, 0.05, 0.3, 0.2, 0.2), op(1, 0, 0.01, 1, 0, 0.3), op(1, 0, 0.01, 1, 0, 0.3)], { lfo: lfo('pitch', 0.15, 5.2), fx: fx({ reverb: { size: 0.6, mix: 0.3 } }) }),
  P('VIBES', 3, [op(1, 98, 0.001, 3.2, 0, 1.2), op(4, 34, 0.001, 0.4, 0, 0.3), op(1, 60, 0.001, 2.6, 0, 1, 3), op(10, 16, 0.001, 0.15, 0, 0.1), op(1, 0, 0.01, 1, 0, 0.3), op(1, 0, 0.01, 1, 0, 0.3)], { lfo: lfo('amp', 0.35, 5.5), fx: fx({ reverb: { size: 0.65, mix: 0.3 } }) }),
  P('SPACE FX', 1, [op(1, 95, 1.2, 2, 0.8, 3), op(3.14, 66, 1.5, 2, 0.6, 3), op(1.41, 50, 2, 2, 0.5, 3), op(7, 40, 2, 3, 0.4, 3), op(1, 0, 0.01, 1, 0, 0.3), OFF], { lfo: lfo('pitch', 0.5, 0.3, 'triangle'), fx: fx({ phaser: { rate: 0.15, depth: 0.8, mix: 0.5 }, delay: { time: 0.5, feedback: 0.6, mix: 0.35 }, reverb: { size: 1, mix: 0.5 } }) }),
  P('METAL HIT', 4, [op(1, 99, 0.001, 0.9, 0, 0.6), op(1.41, 80, 0.001, 0.5, 0, 0.4), op(3.17, 60, 0.001, 0.3, 0, 0.3), op(0.71, 80, 0.001, 1.2, 0, 0.6), op(2.83, 70, 0.001, 0.7, 0, 0.4), op(5.19, 40, 0.001, 0.3, 0, 0.2)], { fx: fx({ distortion: { drive: 0.5, mix: 0.4 }, reverb: { size: 0.6, mix: 0.3 } }) }),
];

export const clonePatch = (p: Patch): Patch => JSON.parse(JSON.stringify(p));

export const midiName = (m: number) => `${['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;
