'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Volume2 } from 'lucide-react';
import { track } from '@/lib/analytics/track';

/**
 * A two-operator FM synth built with the Web Audio API, so visitors can hear
 * what FM synthesis does. It is a demo of the technique, not a recording of
 * the FM-1 (the page says so).
 */
type Params = { ratio: number; index: number; decay: number; attack: number };

const PRESETS: Array<{ id: string; name: string; params: Params }> = [
  { id: 'epiano', name: 'E. Piano', params: { ratio: 1, index: 2.4, decay: 1.6, attack: 0.004 } },
  { id: 'bell', name: 'Glass Bell', params: { ratio: 3.5, index: 4.5, decay: 3, attack: 0.002 } },
  { id: 'bass', name: 'FM Bass', params: { ratio: 0.5, index: 3.2, decay: 0.6, attack: 0.003 } },
  { id: 'brass', name: 'Brass', params: { ratio: 1, index: 5, decay: 1.1, attack: 0.07 } },
];

// One and a bit octaves, C4..E5, laid out like the FM-1's two-row keybed.
const WHITE = [
  { note: 'C4', midi: 60, key: 'a' },
  { note: 'D4', midi: 62, key: 's' },
  { note: 'E4', midi: 64, key: 'd' },
  { note: 'F4', midi: 65, key: 'f' },
  { note: 'G4', midi: 67, key: 'g' },
  { note: 'A4', midi: 69, key: 'h' },
  { note: 'B4', midi: 71, key: 'j' },
  { note: 'C5', midi: 72, key: 'k' },
  { note: 'D5', midi: 74, key: 'l' },
  { note: 'E5', midi: 76, key: ';' },
];
// Black keys sit between white key index i and i+1 (null = gap).
const BLACK: Array<{ note: string; midi: number; key: string } | null> = [
  { note: 'C#4', midi: 61, key: 'w' },
  { note: 'D#4', midi: 63, key: 'e' },
  null,
  { note: 'F#4', midi: 66, key: 't' },
  { note: 'G#4', midi: 68, key: 'y' },
  { note: 'A#4', midi: 70, key: 'u' },
  null,
  { note: 'C#5', midi: 73, key: 'o' },
  { note: 'D#5', midi: 75, key: 'p' },
];
const KEYMAP = new Map<string, number>([...WHITE, ...BLACK.filter(Boolean)].map((k) => [k!.key, k!.midi]));

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

type Voice = { amp: GainNode; car: OscillatorNode; mod: OscillatorNode };

class FmEngine {
  ctx: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  private out: GainNode | null = null;
  private send: GainNode | null = null;
  private voices = new Map<number, Voice>();

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0.22;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 4;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    // Gentle stereo-ish echo send for a bit of space.
    const send = ctx.createGain();
    send.gain.value = 0.18;
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.27;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 3200;
    send.connect(delay);
    delay.connect(tone);
    tone.connect(fb);
    fb.connect(delay);
    tone.connect(master);
    master.connect(comp);
    comp.connect(analyser);
    analyser.connect(ctx.destination);
    this.ctx = ctx;
    this.analyser = analyser;
    this.out = master;
    this.send = send;
    return ctx;
  }

  noteOn(midi: number, p: Params) {
    const ctx = this.ensure();
    this.noteOff(midi, 0.01);
    const t = ctx.currentTime;
    const f = hz(midi);
    const car = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const amp = ctx.createGain();
    car.frequency.value = f;
    mod.frequency.value = f * p.ratio;
    // Modulation depth (Hz) = index × modulator frequency; it decays so the tone mellows like a struck key.
    const depth = p.index * f * p.ratio;
    modGain.gain.setValueAtTime(depth, t);
    modGain.gain.setTargetAtTime(depth * 0.18, t + p.attack, p.decay / 2.5);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.linearRampToValueAtTime(0.9, t + p.attack);
    amp.gain.setTargetAtTime(0.0001, t + p.attack, p.decay / 2);
    mod.connect(modGain);
    modGain.connect(car.frequency);
    car.connect(amp);
    amp.connect(this.out!);
    amp.connect(this.send!);
    car.start(t);
    mod.start(t);
    const stopAt = t + p.attack + p.decay * 4;
    car.stop(stopAt);
    mod.stop(stopAt);
    this.voices.set(midi, { amp, car, mod });
  }

  noteOff(midi: number, release = 0.12) {
    const v = this.voices.get(midi);
    if (!v || !this.ctx) return;
    this.voices.delete(midi);
    const t = this.ctx.currentTime;
    const g = v.amp.gain as AudioParam & { cancelAndHoldAtTime?: (t: number) => void };
    if (g.cancelAndHoldAtTime) g.cancelAndHoldAtTime(t);
    else {
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
    }
    g.setTargetAtTime(0.0001, t, release);
    try {
      v.car.stop(t + release * 6);
      v.mod.stop(t + release * 6);
    } catch {
      // already stopped
    }
  }
}

function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-muted">{label}</span>
        <span className="font-mono text-[13px] text-brand-ink">{format(value)}</span>
      </span>
      <input
        type="range"
        className="knob mt-3 w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ['--fill' as string]: `${fill}%` }}
      />
    </label>
  );
}

export default function FmPlayground() {
  const engine = useRef<FmEngine | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [preset, setPreset] = useState(PRESETS[0].id);
  const [params, setParams] = useState<Params>(PRESETS[0].params);
  const [active, setActive] = useState<Set<number>>(new Set());
  const [started, setStarted] = useState(false);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const pointerNotes = useRef(new Map<number, number>());

  const getEngine = () => (engine.current ??= new FmEngine());

  const on = useCallback(
    (midi: number) => {
      getEngine().noteOn(midi, paramsRef.current);
      setActive((s) => new Set(s).add(midi));
      if (!started) {
        setStarted(true);
        track('fm_demo_play', {}, { once: true });
      }
    },
    [started],
  );
  const off = useCallback((midi: number) => {
    engine.current?.noteOff(midi);
    setActive((s) => {
      const n = new Set(s);
      n.delete(midi);
      return n;
    });
  }, []);

  // Computer keyboard, only while the section is on screen.
  const section = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.3 });
    if (section.current) io.observe(section.current);
    const held = new Set<string>();
    const down = (e: KeyboardEvent) => {
      if (!visible || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const midi = KEYMAP.get(e.key.toLowerCase());
      if (midi === undefined) return;
      e.preventDefault();
      held.add(e.key.toLowerCase());
      on(midi);
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const midi = KEYMAP.get(k);
      if (midi === undefined || !held.has(k)) return;
      held.delete(k);
      off(midi);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      io.disconnect();
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [on, off]);

  // Oscilloscope
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const g = c.getContext('2d')!;
    let raf = 0;
    const buf = new Float32Array(2048);
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (c.width !== w * dpr) {
        c.width = w * dpr;
        c.height = h * dpr;
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      const an = engine.current?.analyser;
      if (an) an.getFloatTimeDomainData(buf);
      else buf.fill(0);
      // Find a rising zero crossing so the wave stands still.
      let start = 0;
      for (let i = 1; i < 1024; i++) if (buf[i - 1] < 0 && buf[i] >= 0) { start = i; break; }
      const grad = g.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'rgba(111,227,207,0.9)');
      grad.addColorStop(1, 'rgba(255,94,31,0.95)');
      g.strokeStyle = grad;
      g.lineWidth = 2;
      g.shadowColor = 'rgba(255,94,31,0.8)';
      g.shadowBlur = 14;
      g.beginPath();
      const n = 900;
      for (let i = 0; i < n; i++) {
        const x = (i / (n - 1)) * w;
        const y = h / 2 - buf[start + i] * h * 0.9;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const keyProps = (midi: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      pointerNotes.current.set(e.pointerId, midi);
      on(midi);
    },
    onPointerUp: (e: React.PointerEvent) => {
      const m = pointerNotes.current.get(e.pointerId);
      if (m !== undefined) off(m);
      pointerNotes.current.delete(e.pointerId);
    },
    onPointerCancel: (e: React.PointerEvent) => {
      const m = pointerNotes.current.get(e.pointerId);
      if (m !== undefined) off(m);
      pointerNotes.current.delete(e.pointerId);
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
        e.preventDefault();
        e.stopPropagation();
        on(midi);
      }
    },
    onKeyUp: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') off(midi);
    },
  });

  return (
    <div ref={section} className="card overflow-hidden p-0">
      <div className="grid lg:grid-cols-[1.25fr_1fr]">
        {/* Screen + keys */}
        <div className="border-b border-white/[0.06] p-5 sm:p-8 lg:border-b-0 lg:border-r">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#07090b] shadow-[inset_0_0_40px_rgb(0_0_0/0.8)]">
            <div className="flex items-center justify-between px-4 pt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-brand-accent2/80">
              <span>{PRESETS.find((p) => p.id === preset)?.name ?? 'Custom'}</span>
              <span className="flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5" /> {started ? 'Live' : 'Tap a key'}
              </span>
            </div>
            <canvas ref={canvas} className="block h-36 w-full sm:h-44" aria-label="Oscilloscope showing the sound wave" role="img" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.03)_1px,transparent_1px)] bg-[size:100%_3px]" />
          </div>

          {/* FM-1 style keybed */}
          <div className="mt-6 select-none rounded-[22px] bg-gradient-to-b from-[#c8492a] to-[#a63b23] p-2.5 shadow-[inset_0_2px_0_rgb(255_255_255/0.15),0_20px_40px_-20px_rgb(255_94_31/0.6)] sm:p-3.5" style={{ touchAction: 'none' }}>
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
              {BLACK.map((b, i) => (
                <div key={i} className="col-span-1 flex justify-end" style={{ gridColumnStart: i + 1 }}>
                  {b ? (
                    <button
                      type="button"
                      aria-label={b.note}
                      {...keyProps(b.midi)}
                      className={`relative z-10 -mr-[calc(39%+2px)] h-14 w-[78%] rounded-full shadow-[inset_0_-3px_0_rgb(0_0_0/0.25),0_4px_8px_rgb(0_0_0/0.25)] transition duration-100 sm:h-16 ${
                        active.has(b.midi) ? 'translate-y-0.5 bg-[#ff9a6b]' : 'bg-[#b8432a] hover:bg-[#c44c31]'
                      }`}
                    >
                      <span className="absolute left-1/2 top-3 h-5 w-[3px] -translate-x-1/2 rounded-full bg-black/45" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-1.5 grid grid-cols-10 gap-1 sm:gap-1.5">
              {WHITE.map((k) => (
                <button
                  key={k.note}
                  type="button"
                  aria-label={k.note}
                  {...keyProps(k.midi)}
                  className={`relative h-20 rounded-full shadow-[inset_0_-4px_0_rgb(0_0_0/0.22),0_6px_10px_rgb(0_0_0/0.25)] transition duration-100 sm:h-24 ${
                    active.has(k.midi) ? 'translate-y-0.5 bg-[#ffb08a]' : 'bg-[#c24a2f] hover:bg-[#cd5336]'
                  }`}
                >
                  <span className="absolute left-1/2 top-1/2 h-9 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/45 sm:h-11" />
                  <span className="absolute bottom-2 left-1/2 hidden -translate-x-1/2 font-mono text-[10px] uppercase text-black/40 sm:block">{k.key}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="mt-4 hidden items-center gap-2 text-xs text-brand-faint sm:flex">
            <Keyboard className="h-4 w-4" /> Play with your computer keys: A S D F G H J K L ; and W E T Y U O P for sharps.
          </p>
        </div>

        {/* Controls */}
        <div className="p-5 sm:p-8">
          <p className="eyebrow">Presets</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPreset(p.id);
                  setParams(p.params);
                  on(p.id === 'bass' ? 48 : 64);
                  window.setTimeout(() => off(p.id === 'bass' ? 48 : 64), 450);
                }}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition duration-300 ease-lux ${
                  preset === p.id ? 'border-brand-accent/60 bg-brand-accent/10 text-brand-ink' : 'border-white/10 bg-white/[0.02] text-brand-muted hover:border-white/20 hover:text-brand-ink'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <div className="mt-8 space-y-7">
            <Slider label="Ratio" value={params.ratio} min={0.5} max={8} step={0.5} format={(v) => `${v.toFixed(1)}:1`} onChange={(ratio) => { setPreset('custom'); setParams((p) => ({ ...p, ratio })); }} />
            <Slider label="Mod index" value={params.index} min={0} max={10} step={0.1} format={(v) => v.toFixed(1)} onChange={(index) => { setPreset('custom'); setParams((p) => ({ ...p, index })); }} />
            <Slider label="Decay" value={params.decay} min={0.2} max={4} step={0.1} format={(v) => `${v.toFixed(1)}s`} onChange={(decay) => { setPreset('custom'); setParams((p) => ({ ...p, decay })); }} />
          </div>
          <p className="mt-8 text-xs leading-relaxed text-brand-faint">
            This is a simple two-operator FM synth running in your browser, so you can hear how ratio and modulation shape a sound.
            It isn&rsquo;t a recording of the FM-1, which has six operators, 128 presets and built-in effects.
          </p>
        </div>
      </div>
    </div>
  );
}
