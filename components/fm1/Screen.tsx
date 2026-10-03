'use client';

import { useEffect, useRef } from 'react';
import { ALGORITHMS, FX_ORDER, isCarrier, midiName, type FxId, type Patch } from '@/lib/fm1/patches';
import type { SeqStep } from '@/lib/fm1/sequencer';

export type Page = 'home' | 'edit' | 'env' | 'lfo' | 'fx' | 'glo' | 'arp' | 'seq' | 'save';
export type Cell = { label: string; value: string } | null;

const FX_NAMES: Record<FxId, string> = { filter: 'Filter', reverb: 'Reverb', delay: 'Delay', distortion: 'Distortion', chorus: 'Chorus', phaser: 'Phaser' };

/** SVG of an algorithm: carriers on the bottom row, modulators stacked above their targets. */
export function AlgDiagram({ alg, selected, className = '' }: { alg: number; selected?: number; className?: string }) {
  const a = ALGORITHMS[alg - 1];
  const depth = new Map<number, number>();
  const calc = (op: number): number => {
    if (depth.has(op)) return depth.get(op)!;
    if (a.carriers.includes(op)) return depth.set(op, 0).get(op)!;
    const targets = a.mods.filter(([m]) => m === op).map(([, t]) => t);
    const d = targets.length ? 1 + Math.max(...targets.map(calc)) : 0;
    depth.set(op, d);
    return d;
  };
  const used = [1, 2, 3, 4, 5, 6].filter((o) => a.carriers.includes(o) || a.mods.some(([m]) => m === o));
  used.forEach(calc);
  const x = new Map<number, number>();
  a.carriers.forEach((c, i) => x.set(c, (i + 0.5) / a.carriers.length));
  const maxD = Math.max(...used.map((o) => depth.get(o)!));
  for (let d = 1; d <= maxD; d++) {
    const row = used.filter((o) => depth.get(o) === d);
    const want = row.map((o) => {
      const ts = a.mods.filter(([m]) => m === o).map(([, t]) => x.get(t) ?? 0.5);
      return { o, x: ts.reduce((s, v) => s + v, 0) / ts.length };
    });
    want.sort((p, q) => p.x - q.x);
    for (let i = 1; i < want.length; i++) if (want[i].x - want[i - 1].x < 0.2) want[i].x = want[i - 1].x + 0.2;
    const over = Math.max(0, want[want.length - 1].x - 0.9);
    want.forEach((w) => x.set(w.o, Math.max(0.1, w.x - over)));
  }
  const W = 100;
  const H = 18 + maxD * 22 + 18;
  const pos = (o: number) => ({ cx: 6 + x.get(o)! * (W - 12), cy: H - 12 - depth.get(o)! * 22 });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className}>
      {a.mods.map(([m, t]) => {
        const p = pos(m);
        const q = pos(t);
        return <line key={`${m}-${t}`} x1={p.cx} y1={p.cy + 5} x2={q.cx} y2={q.cy - 5} stroke="#2a3a44" strokeWidth="1" />;
      })}
      {a.carriers.length > 1 ? <line x1={pos(a.carriers[0]).cx} y1={H - 3} x2={pos(a.carriers[a.carriers.length - 1]).cx} y2={H - 3} stroke="#2a3a44" strokeWidth="1" /> : null}
      {a.carriers.map((c) => (
        <line key={`o${c}`} x1={pos(c).cx} y1={pos(c).cy + 5} x2={pos(c).cx} y2={H - 3} stroke="#2a3a44" strokeWidth="1" />
      ))}
      {used.map((o) => {
        const { cx, cy } = pos(o);
        const sel = selected === o - 1;
        return (
          <g key={o}>
            <rect x={cx - 6} y={cy - 5} width="12" height="10" rx="1.5" fill={sel ? '#1d2a33' : a.carriers.includes(o) ? '#9fb4c1' : '#e8f0f4'} stroke="#1d2a33" strokeWidth="0.8" />
            <text x={cx} y={cy + 2.6} textAnchor="middle" fontSize="7" fontWeight="700" fill={sel ? '#e8f0f4' : '#1d2a33'}>
              {o}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Env({ a, d, s, r }: { a: number; d: number; s: number; r: number }) {
  const scale = (t: number) => Math.min(30, 4 + Math.log10(1 + t * 40) * 14);
  const A = scale(a);
  const D = scale(d);
  const S = 20;
  const R = scale(r);
  const total = A + D + S + R;
  const k = 96 / total;
  const y = (v: number) => 34 - v * 30;
  const pts = [
    [2, y(0)],
    [2 + A * k, y(1)],
    [2 + (A + D) * k, y(s)],
    [2 + (A + D + S) * k, y(s)],
    [2 + total * k, y(0)],
  ];
  return (
    <svg viewBox="0 0 100 36" className="h-full w-full">
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="rgb(29 42 51 / 0.12)" stroke="#1d2a33" strokeWidth="1.4" strokeLinejoin="round" />
      {pts.slice(1, 4).map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="1.6" fill="#1d2a33" />
      ))}
    </svg>
  );
}

function LfoShape({ wave }: { wave: string }) {
  const pts: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const ph = (i / 100) * 2;
    const f = ph % 1;
    const v = wave === 'sine' ? Math.sin(ph * Math.PI * 2) : wave === 'triangle' ? 1 - 4 * Math.abs(f - 0.5) : wave === 'square' ? (f < 0.5 ? 1 : -1) : 2 * f - 1;
    pts.push(`${i},${18 - v * 14}`);
  }
  return (
    <svg viewBox="0 0 100 36" className="h-full w-full">
      <line x1="0" y1="18" x2="100" y2="18" stroke="#9fb4c1" strokeWidth="0.6" strokeDasharray="2 2" />
      <polyline points={pts.join(' ')} fill="none" stroke="#1d2a33" strokeWidth="1.4" />
    </svg>
  );
}

function Scope({ analyser }: { analyser: () => AnalyserNode | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext('2d')!;
    const buf = new Float32Array(1024);
    let raf = 0;
    let last = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 33) return;
      last = t;
      const w = (c.width = c.clientWidth * 2);
      const h = (c.height = c.clientHeight * 2);
      g.clearRect(0, 0, w, h);
      const an = analyser();
      if (an) an.getFloatTimeDomainData(buf);
      else buf.fill(0);
      let start = 0;
      for (let i = 1; i < 512; i++)
        if (buf[i - 1] < 0 && buf[i] >= 0) {
          start = i;
          break;
        }
      g.strokeStyle = '#9fb4c1';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, h / 2);
      g.lineTo(w, h / 2);
      g.stroke();
      g.strokeStyle = '#1d2a33';
      g.lineWidth = 3;
      g.beginPath();
      for (let i = 0; i < 480; i++) {
        const X = (i / 479) * w;
        const Y = h / 2 - buf[start + i] * h * 0.9;
        if (i) g.lineTo(X, Y);
        else g.moveTo(X, Y);
      }
      g.stroke();
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [analyser]);
  return <canvas ref={ref} className="h-full w-full" />;
}

export type ScreenProps = {
  started: boolean;
  page: Page;
  patch: Patch;
  number: number;
  edited: boolean;
  opSel: number;
  fxSel: number;
  cells: Cell[];
  footer: string;
  octave: number;
  bpm: number;
  arpOn: boolean;
  seq: { steps: SeqStep[]; length: number; pos: number; playing: boolean; rec: boolean };
  saveSlot: number;
  saveName: string;
  toast: { title: string; value: string; alg?: number } | null;
  selLatch: boolean;
  analyser: () => AnalyserNode | null;
};

const pad = (n: number) => String(n).padStart(3, '0');

/** The simulated LCD (240×240-ish), sized in container units so it scales with the panel. */
export default function Screen(p: ScreenProps) {
  const alg = ALGORITHMS[p.patch.algorithm - 1];
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[0.5cqw] font-display text-[#1d2a33]" style={{ background: 'linear-gradient(170deg,#d5e3ea 0%,#c3d4de 55%,#b7cad5 100%)' }}>
      {!p.started ? (
        <div className="grid h-full place-items-center text-center">
          <div>
            <p className="font-pixel tracking-wider" style={{ fontSize: '2.1cqw' }}>
              FM-1
            </p>
            <p className="mt-[0.4cqw] font-semibold uppercase tracking-[0.2em]" style={{ fontSize: '0.85cqw' }}>
              Virtual · 6-OP FM
            </p>
            <p className="mt-[1.6cqw] animate-pulse rounded-[0.4cqw] border border-[#1d2a33]/40 px-[0.8cqw] py-[0.3cqw]" style={{ fontSize: '0.95cqw' }}>
              Tap a key to start
            </p>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1d2a33]/50 px-[0.6cqw]" style={{ height: '2.6cqw', fontSize: '1.45cqw' }}>
            <span className="truncate font-medium tracking-tight">
              {pad(p.number)} {p.patch.name}
              {p.edited ? '*' : ''}
            </span>
            <span className="flex items-center gap-[0.4cqw]">
              {p.selLatch ? <span className="rounded-[0.2cqw] bg-[#1d2a33] px-[0.3cqw] font-bold text-[#d5e3ea]" style={{ fontSize: '0.8cqw' }}>SEL</span> : null}
              {p.seq.rec ? <span className="h-[0.7cqw] w-[0.7cqw] animate-pulse rounded-full bg-[#e0322b]" /> : null}
              {p.seq.playing ? <span className="font-bold" style={{ fontSize: '0.9cqw' }}>▶</span> : null}
              <span className="relative inline-block rounded-[0.2cqw] border-[0.12cqw] border-[#1d2a33]" style={{ width: '2cqw', height: '1.15cqw' }}>
                <span className="absolute inset-[0.15cqw] right-[30%] bg-[#1d2a33]" />
              </span>
            </span>
          </div>

          {/* Body */}
          <div className="relative flex-1 overflow-hidden px-[0.6cqw] pt-[0.5cqw]" style={{ fontSize: '1cqw' }}>
            {p.page === 'home' ? (
              <div className="flex h-full flex-col">
                <div className="flex items-baseline justify-between font-semibold" style={{ fontSize: '0.85cqw' }}>
                  <span>ALG {p.patch.algorithm}</span>
                  <span>{p.patch.mono ? 'MONO' : 'POLY'}</span>
                  <span>OCT {p.octave >= 0 ? `+${p.octave}` : p.octave}</span>
                  <span>{p.arpOn ? 'ARP' : `${p.bpm} BPM`}</span>
                </div>
                <div className="relative mt-[0.3cqw] flex-1">
                  <Scope analyser={p.analyser} />
                </div>
              </div>
            ) : null}

            {p.page === 'edit' || p.page === 'env' ? (
              <div className="flex h-full flex-col">
                <div className="grid grid-cols-6 gap-[0.2cqw]">
                  {p.patch.ops.map((o, i) => (
                    <span
                      key={i}
                      className={`rounded-[0.25cqw] border border-[#1d2a33]/60 py-[0.1cqw] text-center font-bold ${i === p.opSel ? 'bg-[#1d2a33] text-[#d5e3ea]' : o.level === 0 ? 'opacity-40' : ''}`}
                      style={{ fontSize: '0.8cqw' }}
                    >
                      OP{i + 1}
                      {isCarrier(p.patch.algorithm, i) ? '•' : ''}
                    </span>
                  ))}
                </div>
                <div className="mt-[0.4cqw] flex-1">
                  {p.page === 'env' ? (
                    <Env {...p.patch.ops[p.opSel]} />
                  ) : (
                    <div className="flex h-full items-center gap-[0.6cqw]">
                      <AlgDiagram alg={p.patch.algorithm} selected={p.opSel} className="h-full max-h-[8cqw] w-1/2" />
                      <div className="flex-1 leading-tight">
                        <p className="font-bold" style={{ fontSize: '1.5cqw' }}>
                          ×{p.patch.ops[p.opSel].ratio.toFixed(2)}
                        </p>
                        <p style={{ fontSize: '0.85cqw' }}>{midiName(60)} → {(261.63 * p.patch.ops[p.opSel].ratio).toFixed(0)} Hz</p>
                        <p className="mt-[0.2cqw] font-semibold" style={{ fontSize: '0.85cqw' }}>
                          {isCarrier(p.patch.algorithm, p.opSel) ? 'Carrier' : 'Modulator'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {p.page === 'lfo' ? (
              <div className="h-full pb-[0.3cqw]">
                <LfoShape wave={p.patch.lfo.wave} />
              </div>
            ) : null}

            {p.page === 'fx' ? (
              <div className="grid grid-cols-3 gap-[0.4cqw]">
                {FX_ORDER.map((id, i) => (
                  <div
                    key={id}
                    className={`relative grid place-items-center rounded-[0.4cqw] border text-center leading-none transition ${
                      i === p.fxSel ? 'border-[#1d2a33] bg-[#1d2a33] text-[#d5e3ea] shadow-[0_0.2cqw_0.4cqw_rgb(0_0_0/0.25)]' : 'border-[#1d2a33]/40 bg-[#e3edf2]/70'
                    }`}
                    style={{ height: '3.2cqw', fontSize: '0.95cqw' }}
                  >
                    {FX_NAMES[id]}
                    {p.patch.fx[id].on ? <span className="absolute bottom-[0.25cqw] h-[0.5cqw] w-[0.5cqw] rounded-full bg-[#e0322b]" /> : null}
                  </div>
                ))}
              </div>
            ) : null}

            {p.page === 'glo' ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <p className="font-pixel" style={{ fontSize: '1.4cqw' }}>
                    GLOBAL
                  </p>
                  <p className="mt-[0.3cqw]" style={{ fontSize: '0.85cqw' }}>
                    Glide, tuning, voice mode, tempo
                  </p>
                </div>
              </div>
            ) : null}

            {p.page === 'arp' ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <p className="font-pixel" style={{ fontSize: '1.6cqw' }}>
                    ARP {p.arpOn ? 'ON' : 'OFF'}
                  </p>
                  <div className="mt-[0.5cqw] flex justify-center gap-[0.25cqw]">
                    {Array.from({ length: 8 }, (_, i) => (
                      <span key={i} className={`h-[0.9cqw] w-[0.9cqw] rounded-[0.15cqw] ${p.arpOn ? 'animate-pulse bg-[#1d2a33]' : 'border border-[#1d2a33]/50'}`} style={{ animationDelay: `${i * 90}ms` }} />
                    ))}
                  </div>
                  <p className="mt-[0.4cqw]" style={{ fontSize: '0.8cqw' }}>
                    Hold notes · press ARP to toggle
                  </p>
                </div>
              </div>
            ) : null}

            {p.page === 'seq' ? (
              <div className="flex h-full flex-col">
                <div className="grid grid-cols-8 gap-[0.2cqw]">
                  {p.seq.steps.map((s, i) => (
                    <span
                      key={i}
                      className={`grid place-items-center rounded-[0.2cqw] border text-center font-semibold leading-none ${i >= p.seq.length ? 'opacity-25' : ''} ${
                        i === p.seq.pos && (p.seq.playing || p.seq.rec) ? 'border-[#1d2a33] bg-[#1d2a33] text-[#d5e3ea]' : s !== null ? 'border-[#1d2a33]/60 bg-[#9fb4c1]' : 'border-[#1d2a33]/30'
                      }`}
                      style={{ height: '2.3cqw', fontSize: '0.65cqw' }}
                    >
                      {s !== null ? midiName(s) : '·'}
                    </span>
                  ))}
                </div>
                <p className="mt-auto pb-[0.2cqw] text-center" style={{ fontSize: '0.8cqw' }}>
                  {p.seq.rec ? 'REC: play notes · SEL = rest' : p.seq.playing ? 'Playing' : 'REC to write · PLAY to run'}
                </p>
              </div>
            ) : null}

            {p.page === 'save' ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <p className="font-semibold" style={{ fontSize: '1cqw' }}>
                    Save patch to
                  </p>
                  <p className="mt-[0.3cqw] font-bold" style={{ fontSize: '1.5cqw' }}>
                    {pad(p.saveSlot + 1)} {p.saveName}
                  </p>
                  <p className="mt-[0.5cqw]" style={{ fontSize: '0.8cqw' }}>
                    SELECT: slot · SAVE: confirm · HOME: cancel
                  </p>
                </div>
              </div>
            ) : null}

            {/* Value pop-up */}
            {p.toast ? (
              <div className="absolute inset-0 grid place-items-center">
                <div
                  key={p.toast.title + p.toast.value}
                  className="animate-scale-in rounded-[0.6cqw] border border-[#1d2a33]/30 px-[1cqw] py-[0.5cqw] text-center shadow-[0_0.3cqw_0.8cqw_rgb(0_0_0/0.25)] [animation-duration:150ms]"
                  style={{ background: 'linear-gradient(180deg,#e6f0f4,#c9dbe4)', minWidth: '9cqw' }}
                >
                  <p className="font-semibold uppercase" style={{ fontSize: '0.8cqw' }}>
                    {p.toast.title}
                  </p>
                  {p.toast.alg ? <AlgDiagram alg={p.toast.alg} className="mx-auto my-[0.15cqw] h-[4.2cqw]" /> : null}
                  <p className="font-bold leading-tight" style={{ fontSize: '1.5cqw' }}>
                    {p.toast.value}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Knob map */}
          <div className="grid grid-cols-4 border-t border-[#1d2a33]/40" style={{ height: '2.4cqw' }}>
            {p.cells.map((c, i) => (
              <div key={i} className={`flex flex-col items-center justify-center leading-none ${i ? 'border-l border-[#1d2a33]/25' : ''}`}>
                {c ? (
                  <>
                    <span className="font-semibold uppercase opacity-70" style={{ fontSize: '0.6cqw' }}>
                      {c.label}
                    </span>
                    <span className="mt-[0.15cqw] font-bold" style={{ fontSize: '0.8cqw' }}>
                      {c.value}
                    </span>
                  </>
                ) : (
                  <span className="opacity-30">–</span>
                )}
              </div>
            ))}
          </div>

          {/* Footer pill */}
          <div className="flex justify-center border-t border-[#1d2a33]/50 py-[0.35cqw]">
            <span className="rounded-[0.35cqw] border border-[#1d2a33]/40 px-[1.2cqw] py-[0.1cqw] shadow-[inset_0_0.1cqw_0_rgb(255_255_255/0.6),0_0.1cqw_0.2cqw_rgb(0_0_0/0.15)]" style={{ fontSize: '0.95cqw', background: 'linear-gradient(180deg,#eef4f7,#c7d7e0)' }}>
              {p.footer || alg.name}
            </span>
          </div>
        </div>
      )}
      {/* Glass + pixel grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(0_0_0/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(0_0_0/0.035)_1px,transparent_1px)] bg-[size:3px_3px]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgb(255_255_255/0.35),transparent_40%)]" />
    </div>
  );
}
