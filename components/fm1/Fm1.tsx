'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, Minimize2, Power } from 'lucide-react';
import { Fm1Engine } from '@/lib/fm1/engine';
import { ALGORITHMS, FX_ORDER, PRESETS, clonePatch, type FilterType, type FxId, type LfoTarget, type Patch, type Wave } from '@/lib/fm1/patches';
import { ARP_MODES, ARP_RATES, arpPattern, emptySteps, stepSeconds, type ArpMode, type SeqStep } from '@/lib/fm1/sequencer';
import { pixel } from '@/app/fonts';
import { colors, type ColorId } from '@/data/store';
import { track } from '@/lib/analytics/track';
import Knob from './Knob';
import Screen, { type Cell, type Page } from './Screen';
import { SKINS } from './skins';

/* ── Panel geometry, in pixels of the 1400×848 reference photo ─────────── */
const W = 1400;
const H = 848;
const px = (x: number) => `${(x / W) * 100}%`;
const py = (y: number) => `${(y / H) * 100}%`;
const cq = (n: number) => `${n / 14}cqw`;

const WHITE_OFFSETS = [0, 2, 4, 6, 7, 9, 11, 12, 14, 16, 18, 19, 21, 23, 24, 26]; // F G A B C D E F G A B C D E F G
const BLACK_OFFSETS = [1, 3, 5, 8, 10, 13, 15, 17, 20, 22, 25];
const BLACK_X = [145, 226, 306, 464, 541, 700, 779, 857, 1015, 1095, 1252];
const BLACK_FN = ['OP1', 'OP2', 'OP3', 'OP4', 'OP5', 'OP6', 'PIT', 'GLO', 'MONO', 'POLY', ''];
const whiteX = (i: number) => 105 + i * 79.2;
const BASE = 53; // F3

// Computer keys (tracker layout from C).
const KEYMAP: Record<string, number> = { a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12, o: 13, l: 14, p: 15, ';': 16, "'": 17 };

const BUTTONS: Array<{ id: string; label: string; x: number; y: number }> = [
  ['FX', 'fx'], ['SEL', 'sel'], ['ENV', 'env'], ['LFO', 'lfo'], ['EDIT', 'edit'], ['GLO', 'glo'],
  ['HOME', 'home'], ['SAVE', 'save'], ['ARP', 'arp'], ['SEQ', 'seq'], ['PLAY/STOP', 'play'], ['REC', 'rec'],
].map(([label, id], i) => ({ id, label, x: [808, 896, 984, 1071, 1158, 1247][i % 6], y: i < 6 ? 286 : 373 }));

const RATIOS = [0.5, 0.71, 1, 1.41, 1.73, 2, 2.23, 2.5, 2.76, 3, 3.14, 3.5, 4, 5, 5.4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const WAVES: Wave[] = ['sine', 'triangle', 'square', 'sawtooth'];
const WAVE_LABEL: Record<Wave, string> = { sine: 'Sine', triangle: 'Tri', square: 'Square', sawtooth: 'Saw' };
const FILTERS: FilterType[] = ['lowpass', 'highpass', 'bandpass'];
const FILTER_LABEL: Record<FilterType, string> = { lowpass: 'Low Pass', highpass: 'High Pass', bandpass: 'Band Pass' };
const TARGETS: LfoTarget[] = ['pitch', 'amp', 'filter'];
const STORAGE = 'fm1.user.v1';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const pct = (v: number) => `${Math.round(v * 100)}%`;
const secs = (v: number) => (v < 1 ? `${Math.round(v * 1000)}ms` : `${v.toFixed(2)}s`);
const freq = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}Hz`);
const cycle = <T,>(list: T[], cur: T, d: number) => list[(list.indexOf(cur) + Math.sign(d) + list.length) % list.length];

type K = { label: string; value: string; turn: (d: number) => void } | null;

export default function Fm1() {
  const engine = useRef<Fm1Engine | null>(null);
  const getEngine = () => (engine.current ??= new Fm1Engine());

  const [bank, setBank] = useState<Patch[]>(() => PRESETS.map(clonePatch));
  const [presetIdx, setPresetIdx] = useState(0);
  const [patch, setPatchState] = useState<Patch>(() => clonePatch(PRESETS[0]));
  const patchRef = useRef(patch);
  const [edited, setEdited] = useState(false);
  const [page, setPage] = useState<Page>('home');
  const [opSel, setOpSel] = useState(0);
  const [fxSel, setFxSel] = useState(0);
  const [octave, setOctave] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [tune, setTune] = useState(0);
  const [bendHeld, setBendHeld] = useState(false);
  const [bpm, setBpm] = useState(112);
  const [arp, setArp] = useState({ on: false, mode: 'up' as ArpMode, rate: 2, octaves: 1, gate: 0.6 });
  const [seq, setSeq] = useState({ steps: emptySteps() as SeqStep[], length: 16, gate: 0.6, transpose: 0 });
  const [playing, setPlaying] = useState(false);
  const [rec, setRec] = useState(false);
  const [pos, setPos] = useState(0);
  const [selLatch, setSelLatch] = useState(false);
  const [lit, setLit] = useState<Set<number>>(() => new Set());
  const [pop, setPop] = useState<{ title: string; value: string; alg?: number } | null>(null);
  const [started, setStarted] = useState(false);
  const [skin, setSkin] = useState<ColorId>('dark');
  const [saveSlot, setSaveSlot] = useState(0);
  const [full, setFull] = useState(false);
  const [vp, setVp] = useState({ w: 0, h: 0 });

  // Refs for timers and fast input
  const st = useRef({ arp, seq, bpm, octave, rec, playing, pos, page });
  st.current = { arp, seq, bpm, octave, rec, playing, pos, page };
  const held = useRef<number[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Patch state ─────────────────────────────────────────────────────── */
  const commit = useCallback((p: Patch, markEdited = true) => {
    patchRef.current = p;
    setPatchState(p);
    if (markEdited) setEdited(true);
  }, []);
  const edit = (fn: (p: Patch) => void) => {
    const p = clonePatch(patchRef.current);
    fn(p);
    commit(p);
    return p;
  };
  const toast = useCallback((title: string, value: string, alg?: number) => {
    setPop({ title, value, alg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setPop(null), alg ? 1400 : 900);
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) || '{}') as Record<string, Patch>;
      const next = PRESETS.map((p, i) => (saved[i] ? saved[i] : clonePatch(p)));
      setBank(next);
      commit(clonePatch(next[0]), false);
    } catch {
      /* storage unavailable */
    }
  }, [commit]);

  useEffect(() => getEngine().setPatch(patch), [patch]);
  useEffect(() => getEngine().setVolume(volume), [volume]);
  useEffect(() => getEngine().setBend(tune + (bendHeld ? 200 : 0)), [tune, bendHeld]);

  const loadPreset = (i: number) => {
    const idx = (i + bank.length) % bank.length;
    getEngine().allOff();
    setPresetIdx(idx);
    commit(clonePatch(bank[idx]), false);
    setEdited(false);
    toast('Preset', `${String(idx + 1).padStart(3, '0')} ${bank[idx].name}`);
  };

  /* ── Notes ───────────────────────────────────────────────────────────── */
  const start = () => {
    getEngine().start();
    if (!started) {
      setStarted(true);
      track('fm_demo_play', {}, { once: true });
    }
  };
  const light = (m: number, on: boolean) =>
    setLit((s) => {
      const n = new Set(s);
      if (on) n.add(m);
      else n.delete(m);
      return n;
    });
  const soundOn = (m: number) => {
    getEngine().noteOn(m);
    light(m, true);
  };
  const soundOff = (m: number) => {
    getEngine().noteOff(m);
    light(m, false);
  };

  const record = (m: number | null) => {
    const { seq: s, playing: pl, pos: p } = st.current;
    const at = pl ? p : p % s.length;
    const steps = [...s.steps];
    steps[at] = m;
    setSeq({ ...s, steps });
    if (!pl) setPos((at + 1) % s.length);
  };

  const press = (m: number) => {
    start();
    if (st.current.rec) record(m);
    if (st.current.arp.on) {
      if (!held.current.includes(m)) held.current.push(m);
      light(m, true);
    } else soundOn(m);
  };
  const release = (m: number) => {
    if (st.current.arp.on) {
      held.current = held.current.filter((n) => n !== m);
      light(m, false);
    } else soundOff(m);
  };

  /* ── Arpeggiator clock ───────────────────────────────────────────────── */
  useEffect(() => {
    if (!arp.on) return;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    let next = performance.now();
    const tick = () => {
      const { arp: a, bpm: b } = st.current;
      const step = stepSeconds(b, ARP_RATES[a.rate].perBeat) * 1000;
      const pattern = arpPattern(held.current, a.mode, a.octaves);
      if (pattern.length) {
        const n = a.mode === 'random' ? pattern[Math.floor(Math.random() * pattern.length)] : pattern[i % pattern.length];
        i++;
        getEngine().noteOn(n);
        setTimeout(() => getEngine().noteOff(n), step * a.gate);
      } else i = 0;
      next += step;
      timer = setTimeout(tick, Math.max(0, next - performance.now()));
    };
    tick();
    return () => clearTimeout(timer);
  }, [arp.on]);

  /* ── Sequencer clock ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!playing) return;
    let p = 0;
    let timer: ReturnType<typeof setTimeout>;
    let next = performance.now();
    const tick = () => {
      const { seq: s, bpm: b } = st.current;
      const step = stepSeconds(b, 4) * 1000;
      const n = s.steps[p % s.length];
      setPos(p % s.length);
      if (n !== null) {
        const m = n + s.transpose;
        getEngine().noteOn(m);
        light(m, true);
        setTimeout(() => {
          getEngine().noteOff(m);
          light(m, false);
        }, step * s.gate);
      }
      p = (p + 1) % s.length;
      next += step;
      timer = setTimeout(tick, Math.max(0, next - performance.now()));
    };
    tick();
    return () => clearTimeout(timer);
  }, [playing]);

  /* ── Buttons ─────────────────────────────────────────────────────────── */
  const button = (id: string) => {
    start();
    const go = (pg: Page) => setPage(pg);
    switch (id) {
      case 'home':
        setSelLatch(false);
        return go('home');
      case 'fx':
      case 'env':
      case 'lfo':
      case 'edit':
      case 'glo':
        return go(id);
      case 'sel': {
        if (st.current.page === 'fx') {
          const fxId = FX_ORDER[fxSel];
          const p = edit((q) => (q.fx[fxId].on = !q.fx[fxId].on));
          return toast(fxId, p.fx[fxId].on ? 'On' : 'Off');
        }
        if (st.current.rec) {
          record(null);
          return toast('Step', 'Rest');
        }
        setSelLatch((v) => !v);
        return;
      }
      case 'save':
        if (st.current.page === 'save') {
          const p = clonePatch(patchRef.current);
          const next = [...bank];
          next[saveSlot] = p;
          setBank(next);
          try {
            const saved = JSON.parse(localStorage.getItem(STORAGE) || '{}');
            saved[saveSlot] = p;
            localStorage.setItem(STORAGE, JSON.stringify(saved));
          } catch {
            /* storage unavailable */
          }
          setPresetIdx(saveSlot);
          setEdited(false);
          go('home');
          return toast('Saved', `${String(saveSlot + 1).padStart(3, '0')} ${p.name}`);
        }
        setSaveSlot(presetIdx);
        return go('save');
      case 'arp': {
        const on = !st.current.arp.on;
        if (!on) {
          held.current.forEach((n) => light(n, false));
          held.current = [];
          getEngine().allOff();
        }
        setArp((a) => ({ ...a, on }));
        go('arp');
        return toast('Arp', on ? 'On' : 'Off');
      }
      case 'seq':
        return go('seq');
      case 'play': {
        if (!st.current.playing && !st.current.seq.steps.some((s) => s !== null)) {
          go('seq');
          return toast('Sequencer', 'Empty · press REC');
        }
        if (st.current.playing) getEngine().allOff();
        setPlaying((v) => !v);
        return;
      }
      case 'rec': {
        const on = !st.current.rec;
        setRec(on);
        if (on && !st.current.playing) setPos(0);
        go('seq');
        return toast('Record', on ? 'On' : 'Off');
      }
    }
  };

  const fnKey = (fn: string) => {
    setSelLatch(false);
    if (fn.startsWith('OP')) {
      const i = Number(fn.slice(2)) - 1;
      setOpSel(i);
      if (!['edit', 'env'].includes(st.current.page)) setPage('edit');
      return toast('Operator', `OP${i + 1}`);
    }
    if (fn === 'MONO' || fn === 'POLY') {
      getEngine().allOff();
      edit((p) => (p.mono = fn === 'MONO'));
      return toast('Voice', fn === 'MONO' ? 'Mono' : 'Poly');
    }
    if (fn === 'GLO') {
      const p = edit((q) => (q.glide = q.glide > 0 ? 0 : 0.12));
      return toast('Glide', p.glide ? secs(p.glide) : 'Off');
    }
    if (fn === 'PIT') return toast('Pitch', 'Hold PIT key: +2 st');
  };

  /* ── Knobs ───────────────────────────────────────────────────────────── */
  const num = (label: string, read: (p: Patch) => number, write: (p: Patch, v: number) => void, o: { min: number; max: number; step?: number; mul?: number; fmt: (v: number) => string }): K => ({
    label,
    value: o.fmt(read(patch)),
    turn: (d) => {
      let v = read(patchRef.current);
      v = o.mul ? v * Math.pow(o.mul, d) : v + d * (o.step ?? 1);
      v = clamp(Math.round(v * 1000) / 1000, o.min, o.max);
      edit((p) => write(p, v));
      toast(label, o.fmt(v));
    },
  });
  const list = <T,>(label: string, values: T[], read: (p: Patch) => T, write: (p: Patch, v: T) => void, fmt: (v: T) => string): K => ({
    label,
    value: fmt(read(patch)),
    turn: (d) => {
      const v = cycle(values, read(patchRef.current), d);
      edit((p) => write(p, v));
      toast(label, fmt(v));
    },
  });
  const local = (label: string, value: string, turn: (d: number) => string): K => ({ label, value, turn: (d) => toast(label, turn(d)) });

  const fxKnobs = (id: FxId): K[] => {
    const on = (p: Patch) => (p.fx[id].on = true);
    const f = <F extends FxId>(fid: F, key: keyof Patch['fx'][F] & string, label: string, o: { min: number; max: number; step?: number; mul?: number; fmt: (v: number) => string }) =>
      num(label, (p) => p.fx[fid][key] as unknown as number, (p, v) => {
        (p.fx[fid] as Record<string, unknown>)[key] = v;
        on(p);
      }, o);
    const u = { min: 0, max: 1, step: 0.01, fmt: pct };
    switch (id) {
      case 'filter':
        return [
          list('Type', FILTERS, (p) => p.fx.filter.type, (p, v) => ((p.fx.filter.type = v), on(p)), (v) => FILTER_LABEL[v]),
          f('filter', 'cutoff', 'Cutoff', { min: 40, max: 18000, mul: 1.06, fmt: freq }),
          f('filter', 'reso', 'Reso', { min: 0.1, max: 15, step: 0.1, fmt: (v) => v.toFixed(1) }),
          null,
        ];
      case 'reverb':
        return [f('reverb', 'size', 'Size', u), f('reverb', 'damp', 'Damp', u), f('reverb', 'mix', 'Mix', u), null];
      case 'delay':
        return [f('delay', 'time', 'Time', { min: 0.03, max: 1.5, step: 0.01, fmt: secs }), f('delay', 'feedback', 'Feedbk', { ...u, max: 0.85 }), f('delay', 'tone', 'Tone', u), f('delay', 'mix', 'Mix', u)];
      case 'distortion':
        return [f('distortion', 'drive', 'Drive', u), f('distortion', 'tone', 'Tone', u), f('distortion', 'mix', 'Mix', u), null];
      case 'chorus':
        return [f('chorus', 'rate', 'Rate', { min: 0.05, max: 8, mul: 1.06, fmt: (v) => `${v.toFixed(2)}Hz` }), f('chorus', 'depth', 'Depth', u), f('chorus', 'mix', 'Mix', u), null];
      case 'phaser':
        return [f('phaser', 'rate', 'Rate', { min: 0.05, max: 6, mul: 1.06, fmt: (v) => `${v.toFixed(2)}Hz` }), f('phaser', 'depth', 'Depth', u), f('phaser', 'feedback', 'Feedbk', { ...u, max: 0.9 }), f('phaser', 'mix', 'Mix', u)];
    }
  };

  const knobs: K[] = (() => {
    const o = opSel;
    switch (page) {
      case 'home': {
        const mods = patch.ops.filter((_, i) => !ALGORITHMS[patch.algorithm - 1].carriers.includes(i + 1));
        const bright = mods.length ? mods.reduce((s, m) => s + m.level, 0) / mods.length : 0;
        return [
          { label: 'Bright', value: String(Math.round(bright)), turn: (d) => {
            const p = edit((q) => q.ops.forEach((op, i) => { if (!ALGORITHMS[q.algorithm - 1].carriers.includes(i + 1) && op.level > 0) op.level = clamp(op.level + d, 1, 99); }));
            const ms = p.ops.filter((_, i) => !ALGORITHMS[p.algorithm - 1].carriers.includes(i + 1));
            toast('Brightness', String(Math.round(ms.reduce((s, m) => s + m.level, 0) / Math.max(1, ms.length))));
          } },
          { label: 'Attack', value: secs(patch.ops[0].a), turn: (d) => { const p = edit((q) => q.ops.forEach((op) => (op.a = clamp(op.a * Math.pow(1.12, d), 0.001, 6)))); toast('Attack', secs(p.ops[0].a)); } },
          { label: 'Release', value: secs(patch.ops[0].r), turn: (d) => { const p = edit((q) => q.ops.forEach((op) => (op.r = clamp(op.r * Math.pow(1.12, d), 0.01, 8)))); toast('Release', secs(p.ops[0].r)); } },
          num('Reverb', (p) => p.fx.reverb.mix, (p, v) => { p.fx.reverb.mix = v; p.fx.reverb.on = v > 0; }, { min: 0, max: 1, step: 0.02, fmt: pct }),
        ];
      }
      case 'edit':
        return [
          { label: 'Ratio', value: `×${patch.ops[o].ratio.toFixed(2)}`, turn: (d) => {
            const cur = patchRef.current.ops[o].ratio;
            let i = RATIOS.reduce((b, r, j) => (Math.abs(r - cur) < Math.abs(RATIOS[b] - cur) ? j : b), 0);
            i = clamp(i + Math.sign(d), 0, RATIOS.length - 1);
            edit((p) => (p.ops[o].ratio = RATIOS[i]));
            toast(`OP${o + 1} Ratio`, `×${RATIOS[i].toFixed(2)}`);
          } },
          num(`Fine`, (p) => p.ops[o].fine, (p, v) => (p.ops[o].fine = v), { min: -50, max: 50, step: 1, fmt: (v) => `${v > 0 ? '+' : ''}${v}¢` }),
          num(`Level`, (p) => p.ops[o].level, (p, v) => (p.ops[o].level = Math.round(v)), { min: 0, max: 99, step: 1, fmt: (v) => String(Math.round(v)) }),
          list('Wave', WAVES, (p) => p.ops[o].wave, (p, v) => (p.ops[o].wave = v), (v) => WAVE_LABEL[v]),
        ];
      case 'env':
        return [
          num('Attack', (p) => p.ops[o].a, (p, v) => (p.ops[o].a = v), { min: 0.001, max: 6, mul: 1.12, fmt: secs }),
          num('Decay', (p) => p.ops[o].d, (p, v) => (p.ops[o].d = v), { min: 0.01, max: 8, mul: 1.12, fmt: secs }),
          num('Sustain', (p) => p.ops[o].s, (p, v) => (p.ops[o].s = v), { min: 0, max: 1, step: 0.02, fmt: pct }),
          num('Release', (p) => p.ops[o].r, (p, v) => (p.ops[o].r = v), { min: 0.01, max: 8, mul: 1.12, fmt: secs }),
        ];
      case 'lfo':
        return [
          list('Wave', WAVES, (p) => p.lfo.wave, (p, v) => (p.lfo.wave = v), (v) => WAVE_LABEL[v]),
          num('Rate', (p) => p.lfo.rate, (p, v) => (p.lfo.rate = v), { min: 0.05, max: 20, mul: 1.07, fmt: (v) => `${v.toFixed(2)}Hz` }),
          num('Depth', (p) => p.lfo.depth, (p, v) => (p.lfo.depth = v), { min: 0, max: 1, step: 0.02, fmt: pct }),
          list('Dest', TARGETS, (p) => p.lfo.target, (p, v) => (p.lfo.target = v), (v) => v[0].toUpperCase() + v.slice(1)),
        ];
      case 'fx':
        return fxKnobs(FX_ORDER[fxSel]);
      case 'glo':
        return [
          num('Glide', (p) => p.glide, (p, v) => (p.glide = v), { min: 0, max: 1, step: 0.01, fmt: (v) => (v ? secs(v) : 'Off') }),
          local('Tune', `${tune > 0 ? '+' : ''}${tune}¢`, (d) => { const v = clamp(tune + d, -100, 100); setTune(v); return `${v > 0 ? '+' : ''}${v}¢`; }),
          list('Mode', [false, true], (p) => p.mono, (p, v) => { getEngine().allOff(); p.mono = v; }, (v) => (v ? 'Mono' : 'Poly')),
          local('Tempo', `${bpm}`, (d) => { const v = clamp(bpm + d, 50, 220); setBpm(v); return `${v} BPM`; }),
        ];
      case 'arp':
        return [
          local('Mode', arp.mode, (d) => { const v = cycle(ARP_MODES, arp.mode, d); setArp({ ...arp, mode: v }); return v; }),
          local('Rate', ARP_RATES[arp.rate].label, (d) => { const v = clamp(arp.rate + Math.sign(d), 0, ARP_RATES.length - 1); setArp({ ...arp, rate: v }); return ARP_RATES[v].label; }),
          local('Octave', String(arp.octaves), (d) => { const v = clamp(arp.octaves + Math.sign(d), 1, 3); setArp({ ...arp, octaves: v }); return String(v); }),
          local('Gate', pct(arp.gate), (d) => { const v = clamp(arp.gate + d * 0.02, 0.05, 1); setArp({ ...arp, gate: v }); return pct(v); }),
        ];
      case 'seq':
        return [
          local('Tempo', `${bpm}`, (d) => { const v = clamp(bpm + d, 50, 220); setBpm(v); return `${v} BPM`; }),
          local('Gate', pct(seq.gate), (d) => { const v = clamp(seq.gate + d * 0.02, 0.05, 1); setSeq({ ...seq, gate: v }); return pct(v); }),
          local('Length', String(seq.length), (d) => { const v = clamp(seq.length + Math.sign(d), 1, 16); setSeq({ ...seq, length: v }); return `${v} steps`; }),
          local('Transp', `${seq.transpose > 0 ? '+' : ''}${seq.transpose}`, (d) => { const v = clamp(seq.transpose + Math.sign(d), -12, 12); setSeq({ ...seq, transpose: v }); return `${v > 0 ? '+' : ''}${v} st`; }),
        ];
      default:
        return [null, null, null, null];
    }
  })();

  const cells: Cell[] = knobs.map((k) => (k ? { label: k.label, value: k.value } : null));

  const selectTurn = (d: number) => {
    switch (page) {
      case 'edit':
      case 'env': {
        const v = clamp(opSel + Math.sign(d), 0, 5);
        setOpSel(v);
        return toast('Operator', `OP${v + 1}`);
      }
      case 'fx': {
        const v = clamp(fxSel + Math.sign(d), 0, 5);
        return setFxSel(v);
      }
      case 'save': {
        const v = (saveSlot + Math.sign(d) + bank.length) % bank.length;
        return setSaveSlot(v);
      }
      default:
        return loadPreset(presetIdx + Math.sign(d));
    }
  };

  const footer = (() => {
    switch (page) {
      case 'home':
        return ALGORITHMS[patch.algorithm - 1].name;
      case 'edit':
        return `OP${opSel + 1} Oscillator`;
      case 'env':
        return `OP${opSel + 1} Envelope`;
      case 'lfo':
        return `LFO → ${patch.lfo.target}`;
      case 'fx': {
        const id = FX_ORDER[fxSel];
        return id === 'filter' ? `Type: ${FILTER_LABEL[patch.fx.filter.type]}` : `${id[0].toUpperCase() + id.slice(1)}: ${patch.fx[id].on ? 'On' : 'Off'}`;
      }
      case 'glo':
        return 'Global';
      case 'arp':
        return `ARP ${arp.mode.toUpperCase()} ${ARP_RATES[arp.rate].label}`;
      case 'seq':
        return rec ? 'Recording' : playing ? 'Playing' : `${seq.length} steps`;
      case 'save':
        return 'Save';
    }
  })();

  /* ── Computer keyboard ───────────────────────────────────────────────── */
  const rootRef = useRef<HTMLDivElement>(null);
  const actions = useRef({ press, release, setOctave, toast });
  actions.current = { press, release, setOctave, toast };
  useEffect(() => {
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.25 });
    if (rootRef.current) io.observe(rootRef.current);
    const down = new Map<string, number>();
    const kd = (e: KeyboardEvent) => {
      if (!visible || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.getAttribute('role') === 'slider') return;
      const k = e.key.toLowerCase();
      if (k === 'z' || k === 'x') {
        const v = clamp(st.current.octave + (k === 'x' ? 1 : -1), -3, 3);
        actions.current.setOctave(v);
        actions.current.toast('Octave', v > 0 ? `+${v}` : String(v));
        return;
      }
      if (k in KEYMAP) {
        e.preventDefault();
        const m = 60 + st.current.octave * 12 + KEYMAP[k];
        down.set(k, m);
        actions.current.press(m);
      }
    };
    const ku = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const m = down.get(k);
      if (m !== undefined) {
        down.delete(k);
        actions.current.release(m);
      }
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => {
      io.disconnect();
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }, []);

  /* ── Keybed pointer handling (multi-touch + glissando) ───────────────── */
  const pointers = useRef(new Map<number, { midi: number | null; fn: string | null }>());
  const base = BASE + octave * 12;
  const keyAt = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)?.closest('[data-midi]') as HTMLElement | null;
    return el ? { midi: Number(el.dataset.midi), fn: el.dataset.fn || null } : null;
  };
  const keyDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const k = keyAt(e.clientX, e.clientY);
    if (!k) return;
    if (selLatch && k.fn) {
      fnKey(k.fn);
      pointers.current.set(e.pointerId, { midi: null, fn: k.fn });
      if (k.fn === 'PIT') setBendHeld(true);
      return;
    }
    if (k.fn === 'PIT' && bendHeld) return;
    pointers.current.set(e.pointerId, { midi: k.midi, fn: null });
    press(k.midi);
  };
  const keyMove = (e: React.PointerEvent) => {
    const cur = pointers.current.get(e.pointerId);
    if (!cur || cur.midi === null) return;
    const k = keyAt(e.clientX, e.clientY);
    if (k && k.midi !== cur.midi) {
      release(cur.midi);
      press(k.midi);
      cur.midi = k.midi;
    }
  };
  const keyUp = (e: React.PointerEvent) => {
    const cur = pointers.current.get(e.pointerId);
    pointers.current.delete(e.pointerId);
    if (!cur) return;
    if (cur.fn === 'PIT') setBendHeld(false);
    if (cur.midi !== null) release(cur.midi);
  };

  /* ── Full screen (rotates on portrait phones) ────────────────────────── */
  useEffect(() => {
    if (!full) return;
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFull(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [full]);
  const toggleFull = async () => {
    const next = !full;
    setFull(next);
    try {
      if (next) {
        await document.documentElement.requestFullscreen?.();
        await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape');
      } else if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* not supported (e.g. iPhone): the CSS rotation below covers it */
    }
  };
  useEffect(() => {
    const onFs = () => !document.fullscreenElement && setFull(false);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);
  const rotate = full && vp.h > vp.w;
  const availW = rotate ? vp.h : vp.w;
  const availH = rotate ? vp.w : vp.h;
  const fullWidth = Math.min(availW * 0.97, (availH * 0.97 * W) / H);

  const s = SKINS[skin];
  const analyser = useMemo(() => () => engine.current?.analyser ?? null, []);

  const panel = (
    <div style={{ containerType: 'inline-size', width: full ? fullWidth : '100%' }} className={full ? '' : 'w-full'}>
      <div
        className={`${pixel.variable} relative w-full select-none`}
        style={{ aspectRatio: `${W} / ${H}`, touchAction: 'manipulation' }}
        onPointerDown={start}
      >
        {/* Body */}
        <div
          className="absolute inset-0 rounded-[5cqw]"
          style={{
            background: `linear-gradient(170deg, ${s.body[0]}, ${s.body[1]})`,
            boxShadow: `inset 0 0.25cqw 0 rgb(255 255 255 / 0.18), inset 0 -0.4cqw 0.6cqw rgb(0 0 0 / 0.25), 0 3cqw 5cqw -1.5cqw ${s.shadow}, 0 0.4cqw 0.8cqw rgb(0 0 0 / 0.35)`,
          }}
        />

        {/* Knobs */}
        <Knob label="Master" x={115} y={133} labelColor={s.label} angle={-135 + volume * 270} valueText={`${Math.round(volume * 100)}%`} onStart={start} onTurn={(d) => setVolume((v) => { const n = clamp(v + d * 0.02, 0, 1); toast('Volume', String(Math.round(n * 100))); return n; })} />
        <Knob label="Select" x={265} y={133} labelColor={s.label} onStart={start} onTurn={selectTurn} />
        <Knob label="Presets" x={115} y={278} labelColor={s.label} onStart={start} onTurn={(d) => loadPreset(presetIdx + Math.sign(d))} />
        <Knob
          label="Algorithm"
          x={265}
          y={278}
          labelColor={s.label}
          onStart={start}
          onTurn={(d) => {
            const a = clamp(patchRef.current.algorithm + Math.sign(d), 1, ALGORITHMS.length);
            getEngine().allOff();
            edit((p) => (p.algorithm = a));
            toast(`Algorithm ${a}`, ALGORITHMS[a - 1].name, a);
          }}
        />
        {[790, 945, 1103, 1260].map((x, i) => (
          <Knob key={x} label={`Knob${i + 1}`} x={x} y={133} labelColor={s.label} valueText={knobs[i]?.value} onStart={start} onTurn={(d) => knobs[i]?.turn(d)} />
        ))}

        {/* Octave */}
        <div className="absolute rounded-[0.9cqw]" style={{ left: px(82), top: py(358), width: cq(216), height: cq(68), background: s.btnBlock, boxShadow: 'inset 0 0.15cqw 0.3cqw rgb(0 0 0 / 0.35)' }} />
        {[
          { label: 'OCT-', x: 96, w: 94, d: -1 },
          { label: 'OCT+', x: 204, w: 84, d: 1 },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            aria-label={b.d < 0 ? 'Octave down' : 'Octave up'}
            onClick={() => {
              start();
              const v = clamp(octave + b.d, -3, 3);
              setOctave(v);
              toast('Octave', v > 0 ? `+${v}` : String(v));
            }}
            className="absolute grid place-items-center rounded-[0.7cqw] font-display font-extrabold transition active:translate-y-[0.15cqw] active:brightness-90"
            style={{ left: px(b.x), top: py(368), width: cq(b.w), height: cq(48), background: s.btn, color: s.btnText, fontSize: '1.15cqw', boxShadow: '0 0.25cqw 0 rgb(0 0 0 / 0.35), inset 0 0.1cqw 0 rgb(255 255 255 / 0.12)' }}
          >
            {b.label}
          </button>
        ))}

        {/* Screen */}
        <div className="absolute rounded-[3.3cqw] bg-[#0b0b0c]" style={{ left: px(362), top: py(62), width: cq(332), height: cq(332), boxShadow: 'inset 0 0.2cqw 0.4cqw rgb(255 255 255 / 0.08), 0 0.3cqw 0.6cqw rgb(0 0 0 / 0.4)' }} />
        <div className="absolute" style={{ left: px(408), top: py(108), width: cq(240), height: cq(242) }}>
          <Screen
            started={started}
            page={page}
            patch={patch}
            number={presetIdx + 1}
            edited={edited}
            opSel={opSel}
            fxSel={fxSel}
            cells={cells}
            footer={footer}
            octave={octave}
            bpm={bpm}
            arpOn={arp.on}
            seq={{ steps: seq.steps, length: seq.length, pos, playing, rec }}
            saveSlot={saveSlot}
            saveName={bank[saveSlot]?.name ?? ''}
            toast={pop}
            selLatch={selLatch}
            analyser={analyser}
          />
        </div>

        {/* Function buttons */}
        <div className="absolute rounded-[1.6cqw]" style={{ left: px(748), top: py(232), width: cq(560), height: cq(196), background: s.btnBlock, boxShadow: 'inset 0 0.15cqw 0.3cqw rgb(0 0 0 / 0.35)' }} />
        {BUTTONS.map((b) => {
          const active =
            (b.id === page && !['sel', 'save'].includes(b.id)) ||
            (b.id === 'save' && page === 'save') ||
            (b.id === 'sel' && selLatch) ||
            (b.id === 'arp' && arp.on) ||
            (b.id === 'play' && playing) ||
            (b.id === 'rec' && rec);
          const red = b.id === 'rec' && rec;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => button(b.id)}
              aria-pressed={active}
              aria-label={b.id === 'play' ? 'Play/Stop' : b.label}
              className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[0.8cqw] text-center font-display font-extrabold leading-[1.05] transition active:translate-y-[calc(-50%+0.15cqw)] active:brightness-90"
              style={{
                left: px(b.x),
                top: py(b.y),
                width: cq(72),
                height: cq(72),
                background: s.btn,
                color: red ? '#ff4b3e' : active ? s.lit : s.btnText,
                fontSize: b.id === 'play' ? '0.95cqw' : '1.2cqw',
                boxShadow: `0 0.3cqw 0 rgb(0 0 0 / 0.38), inset 0 0.1cqw 0 rgb(255 255 255 / 0.12)${active ? `, 0 0 1.2cqw -0.2cqw ${red ? '#ff4b3e' : s.lit}` : ''}`,
                textShadow: active ? `0 0 0.6cqw ${red ? '#ff4b3e' : s.lit}` : 'none',
              }}
            >
              {b.id === 'play' ? (
                <span>
                  <span className="block border-b-[0.12cqw] pb-[0.1cqw]" style={{ borderColor: 'currentColor' }}>PLAY</span>
                  <span className="block pt-[0.1cqw]">STOP</span>
                </span>
              ) : (
                b.label
              )}
            </button>
          );
        })}
        <span className="absolute h-[0.45cqw] w-[0.45cqw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70" style={{ left: px(1027), top: py(330) }} />

        {/* Keybed */}
        <div
          className="absolute touch-none rounded-[2.9cqw]"
          style={{ left: px(52), top: py(478), width: cq(1296), height: cq(302), background: s.keybed, boxShadow: 'inset 0 0.3cqw 0.6cqw rgb(0 0 0 / 0.35)' }}
          onPointerDown={keyDown}
          onPointerMove={keyMove}
          onPointerUp={keyUp}
          onPointerCancel={keyUp}
          onContextMenu={(e) => e.preventDefault()}
        />
        {[382, 622, 937, 1174].map((x) => (
          <span key={x} className="pointer-events-none absolute h-[0.4cqw] w-[0.4cqw] -translate-x-1/2 rounded-full bg-black/70" style={{ left: px(x), top: py(626) }} />
        ))}
        {BLACK_OFFSETS.map((off, i) => {
          const midi = base + off;
          const on = lit.has(midi) || (BLACK_FN[i] === 'PIT' && bendHeld);
          const fn = BLACK_FN[i];
          return (
            <div
              key={`b${i}`}
              data-midi={midi}
              data-fn={fn || undefined}
              className="absolute -translate-x-1/2 rounded-full transition-transform duration-75"
              style={{
                left: px(BLACK_X[i]),
                top: py(498),
                width: cq(70),
                height: cq(128),
                background: s.key,
                transform: `translateX(-50%) translateY(${on ? '0.2cqw' : '0'})`,
                boxShadow: on ? `inset 0 0.2cqw 0.4cqw rgb(0 0 0 / 0.4)` : '0 0.35cqw 0 rgb(0 0 0 / 0.35), inset 0 0.1cqw 0 rgb(255 255 255 / 0.08)',
              }}
              onPointerDown={keyDown}
              onPointerMove={keyMove}
              onPointerUp={keyUp}
              onPointerCancel={keyUp}
            >
              <span
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full transition-[background,box-shadow] duration-100"
                style={{ top: fn ? '22%' : '20%', height: fn ? '30%' : '58%', width: '0.45cqw', background: on ? s.lit : s.keyLine, boxShadow: on ? `0 0 0.8cqw ${s.lit}` : 'none' }}
              />
              {fn ? (
                <span className="pointer-events-none absolute inset-x-0 text-center font-display font-semibold" style={{ top: '66%', fontSize: '1.05cqw', color: selLatch ? s.lit : s.keyText }}>
                  {fn}
                </span>
              ) : null}
            </div>
          );
        })}
        {WHITE_OFFSETS.map((off, i) => {
          const midi = base + off;
          const on = lit.has(midi);
          return (
            <div
              key={`w${i}`}
              data-midi={midi}
              className="absolute -translate-x-1/2 rounded-full transition-transform duration-75"
              style={{
                left: px(whiteX(i)),
                top: py(632),
                width: cq(70),
                height: cq(130),
                background: s.key,
                transform: `translateX(-50%) translateY(${on ? '0.2cqw' : '0'})`,
                boxShadow: on ? `inset 0 0.2cqw 0.4cqw rgb(0 0 0 / 0.4)` : '0 0.35cqw 0 rgb(0 0 0 / 0.35), inset 0 0.1cqw 0 rgb(255 255 255 / 0.08)',
              }}
              onPointerDown={keyDown}
              onPointerMove={keyMove}
              onPointerUp={keyUp}
              onPointerCancel={keyUp}
            >
              <span
                className="pointer-events-none absolute left-1/2 top-[22%] h-[56%] -translate-x-1/2 rounded-full transition-[background,box-shadow] duration-100"
                style={{ width: '0.45cqw', background: on ? s.lit : s.keyLine, boxShadow: on ? `0 0 0.8cqw ${s.lit}` : 'none' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={rootRef}>
      {full ? (
        <div className="fixed inset-0 z-[90] overflow-hidden bg-[#050506]">
          <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(-50%, -50%)${rotate ? ' rotate(90deg)' : ''}` }}>
            {panel}
          </div>
          <button type="button" onClick={toggleFull} className="glass fixed right-3 top-3 z-[91] grid h-11 w-11 place-items-center rounded-full text-white" aria-label="Exit full screen">
            <Minimize2 className="h-5 w-5" />
          </button>
        </div>
      ) : (
        panel
      )}

      {(
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2" role="radiogroup" aria-label="Panel color">
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={skin === c.id}
                aria-label={`${c.name} panel`}
                title={c.name}
                onClick={() => setSkin(c.id)}
                className={`h-9 w-9 rounded-full transition duration-300 ease-lux ${skin === c.id ? 'scale-110 ring-2 ring-white/80 ring-offset-2 ring-offset-brand-surface' : 'opacity-70 hover:opacity-100'}`}
                style={{ background: `linear-gradient(135deg, ${c.swatch[0]} 50%, ${c.swatch[1]} 50%)` }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!started ? (
              <button type="button" onClick={start} className="btn-ghost !px-4 !py-2.5 text-sm">
                <Power className="h-4 w-4 text-brand-accent2" /> Start audio
              </button>
            ) : null}
            <button type="button" onClick={toggleFull} className="btn-ghost !px-4 !py-2.5 text-sm">
              <Maximize2 className="h-4 w-4" /> Full screen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
