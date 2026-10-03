/**
 * Virtual FM-1 audio engine (Web Audio, browser only).
 *
 * Voice: 6 operators. Each operator is an oscillator with a normalized ADSR
 * gain. Carriers feed the voice output; modulators feed target oscillators'
 * frequency with depth = index × modulator frequency (classic FM).
 *
 * Chain: voices → tremolo → filter → distortion → chorus → phaser → delay →
 * reverb → master → limiter → analyser → speakers.
 */
import { ALGORITHMS, type FxState, type Lfo, type Patch } from './patches';

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);
const MAX_INDEX = 9;
const modIndex = (level: number) => Math.pow(level / 99, 2) * MAX_INDEX;
const carrierAmp = (level: number) => Math.pow(level / 99, 1.6);

function holdAt(p: AudioParam, t: number) {
  const anyP = p as AudioParam & { cancelAndHoldAtTime?: (t: number) => void };
  if (anyP.cancelAndHoldAtTime) anyP.cancelAndHoldAtTime(t);
  else {
    p.cancelScheduledValues(t);
    p.setValueAtTime(p.value, t);
  }
}

/** Mix helper: input → dry → output, input → [effect] → wet → output. */
class Insert {
  input: GainNode;
  output: GainNode;
  dry: GainNode;
  wet: GainNode;
  constructor(protected ctx: AudioContext) {
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.dry = ctx.createGain();
    this.wet = ctx.createGain();
    this.input.connect(this.dry).connect(this.output);
    this.wet.connect(this.output);
    this.wet.gain.value = 0;
  }
  mix(on: boolean, mix: number, keepDry = false) {
    const t = this.ctx.currentTime;
    this.wet.gain.setTargetAtTime(on ? mix : 0, t, 0.02);
    this.dry.gain.setTargetAtTime(on && !keepDry ? 1 - mix * 0.5 : 1, t, 0.02);
  }
}

class Distortion extends Insert {
  shaper: WaveShaperNode;
  tone: BiquadFilterNode;
  private drive = -1;
  constructor(ctx: AudioContext) {
    super(ctx);
    this.shaper = ctx.createWaveShaper();
    this.shaper.oversample = '2x';
    this.tone = ctx.createBiquadFilter();
    this.tone.type = 'lowpass';
    this.input.connect(this.shaper).connect(this.tone).connect(this.wet);
  }
  set(p: FxState['distortion']) {
    if (p.drive !== this.drive) {
      this.drive = p.drive;
      const k = 2 + p.drive * 60;
      const curve = new Float32Array(1024);
      for (let i = 0; i < curve.length; i++) {
        const x = (i / (curve.length - 1)) * 2 - 1;
        curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x)) * 0.7;
      }
      this.shaper.curve = curve;
    }
    this.tone.frequency.setTargetAtTime(800 + p.tone * 9000, this.ctx.currentTime, 0.02);
    this.mix(p.on, p.mix);
  }
}

class Chorus extends Insert {
  delay: DelayNode;
  lfo: OscillatorNode;
  depth: GainNode;
  constructor(ctx: AudioContext) {
    super(ctx);
    this.delay = ctx.createDelay(0.1);
    this.delay.delayTime.value = 0.016;
    this.lfo = ctx.createOscillator();
    this.depth = ctx.createGain();
    this.lfo.connect(this.depth).connect(this.delay.delayTime);
    this.lfo.start();
    this.input.connect(this.delay).connect(this.wet);
  }
  set(p: FxState['chorus']) {
    const t = this.ctx.currentTime;
    this.lfo.frequency.setTargetAtTime(p.rate, t, 0.05);
    this.depth.gain.setTargetAtTime(0.0005 + p.depth * 0.006, t, 0.05);
    this.mix(p.on, p.mix, true);
  }
}

class Phaser extends Insert {
  stages: BiquadFilterNode[];
  lfo: OscillatorNode;
  depth: GainNode;
  fb: GainNode;
  constructor(ctx: AudioContext) {
    super(ctx);
    this.stages = Array.from({ length: 4 }, () => {
      const f = ctx.createBiquadFilter();
      f.type = 'allpass';
      f.frequency.value = 900;
      f.Q.value = 0.6;
      return f;
    });
    this.lfo = ctx.createOscillator();
    this.depth = ctx.createGain();
    this.fb = ctx.createGain();
    this.lfo.connect(this.depth);
    this.stages.forEach((s) => this.depth.connect(s.frequency));
    this.lfo.start();
    let node: AudioNode = this.input;
    for (const s of this.stages) {
      node.connect(s);
      node = s;
    }
    node.connect(this.wet);
    node.connect(this.fb).connect(this.stages[0]);
  }
  set(p: FxState['phaser']) {
    const t = this.ctx.currentTime;
    this.lfo.frequency.setTargetAtTime(p.rate, t, 0.05);
    this.depth.gain.setTargetAtTime(200 + p.depth * 1400, t, 0.05);
    this.fb.gain.setTargetAtTime(p.feedback * 0.7, t, 0.05);
    this.mix(p.on, p.mix);
  }
}

class Echo extends Insert {
  delay: DelayNode;
  fb: GainNode;
  tone: BiquadFilterNode;
  constructor(ctx: AudioContext) {
    super(ctx);
    this.delay = ctx.createDelay(2);
    this.fb = ctx.createGain();
    this.tone = ctx.createBiquadFilter();
    this.tone.type = 'lowpass';
    this.input.connect(this.delay);
    this.delay.connect(this.tone);
    this.tone.connect(this.fb).connect(this.delay);
    this.tone.connect(this.wet);
  }
  set(p: FxState['delay']) {
    const t = this.ctx.currentTime;
    this.delay.delayTime.setTargetAtTime(p.time, t, 0.05);
    this.fb.gain.setTargetAtTime(Math.min(0.85, p.feedback), t, 0.02);
    this.tone.frequency.setTargetAtTime(1200 + p.tone * 8000, t, 0.02);
    this.mix(p.on, p.mix, true);
  }
}

class Reverb extends Insert {
  conv: ConvolverNode;
  damp: BiquadFilterNode;
  private size = -1;
  private timer: ReturnType<typeof setTimeout> | null = null;
  constructor(ctx: AudioContext) {
    super(ctx);
    this.conv = ctx.createConvolver();
    this.damp = ctx.createBiquadFilter();
    this.damp.type = 'lowpass';
    this.input.connect(this.conv).connect(this.damp).connect(this.wet);
  }
  private build(size: number) {
    const ctx = this.ctx;
    const seconds = 0.6 + size * 3.6;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    this.conv.buffer = buf;
  }
  set(p: FxState['reverb']) {
    if (p.size !== this.size) {
      const first = this.size < 0;
      this.size = p.size;
      if (this.timer) clearTimeout(this.timer);
      if (first) this.build(p.size);
      else this.timer = setTimeout(() => this.build(p.size), 160);
    }
    this.damp.frequency.setTargetAtTime(1500 + (1 - p.damp) * 9000, this.ctx.currentTime, 0.02);
    this.mix(p.on, p.mix, true);
  }
}

class Voice {
  oscs: OscillatorNode[] = [];
  envs: GainNode[] = [];
  depths: Array<{ gain: GainNode; mod: number }> = [];
  carriers: Array<{ gain: GainNode; op: number }> = [];
  out: GainNode;
  midi: number;
  released = false;

  constructor(
    private e: Fm1Engine,
    midi: number,
    private patch: Patch,
  ) {
    const ctx = e.ctx!;
    this.midi = midi;
    const alg = ALGORITHMS[patch.algorithm - 1];
    this.out = ctx.createGain();
    this.out.gain.value = (patch.volume * 0.55) / Math.sqrt(alg.carriers.length);
    this.out.connect(e.voiceBus!);
    const f = hz(midi);
    patch.ops.forEach((o) => {
      const osc = ctx.createOscillator();
      osc.type = o.wave;
      osc.frequency.value = f * o.ratio * Math.pow(2, o.fine / 1200);
      e.modBus!.connect(osc.detune);
      const env = ctx.createGain();
      env.gain.value = 0;
      osc.connect(env);
      this.oscs.push(osc);
      this.envs.push(env);
    });
    for (const [m, t] of alg.mods) {
      const g = ctx.createGain();
      g.gain.value = modIndex(patch.ops[m - 1].level) * this.oscs[m - 1].frequency.value;
      this.envs[m - 1].connect(g).connect(this.oscs[t - 1].frequency);
      this.depths.push({ gain: g, mod: m - 1 });
    }
    for (const c of alg.carriers) {
      const g = ctx.createGain();
      g.gain.value = carrierAmp(patch.ops[c - 1].level);
      this.envs[c - 1].connect(g).connect(this.out);
      this.carriers.push({ gain: g, op: c - 1 });
    }
    const t = ctx.currentTime + 0.005;
    this.oscs.forEach((o) => o.start(t));
    this.trigger(t);
  }

  trigger(t: number) {
    this.released = false;
    this.patch.ops.forEach((o, i) => {
      const g = this.envs[i].gain;
      holdAt(g, t);
      g.linearRampToValueAtTime(1, t + Math.max(0.001, o.a));
      g.setTargetAtTime(Math.max(0, o.s), t + Math.max(0.001, o.a), Math.max(0.005, o.d) / 3);
    });
  }

  /** Mono legato: slide every operator to the new note. */
  glideTo(midi: number, time: number) {
    this.midi = midi;
    const ctx = this.e.ctx!;
    const t = ctx.currentTime;
    const f = hz(midi);
    this.patch.ops.forEach((o, i) => {
      const target = f * o.ratio * Math.pow(2, o.fine / 1200);
      const p = this.oscs[i].frequency;
      holdAt(p, t);
      if (time > 0) p.setTargetAtTime(target, t, time / 3);
      else p.setValueAtTime(target, t);
    });
    this.depths.forEach(({ gain, mod }) => {
      const o = this.patch.ops[mod];
      const target = modIndex(o.level) * f * o.ratio;
      holdAt(gain.gain, t);
      gain.gain.setTargetAtTime(target, t, Math.max(0.005, time / 3));
    });
  }

  /** Live edits (ratio/fine/level/wave) while the note sounds. */
  update(patch: Patch) {
    if (patch.algorithm !== this.patch.algorithm) return;
    const ctx = this.e.ctx!;
    const t = ctx.currentTime;
    const f = hz(this.midi);
    patch.ops.forEach((o, i) => {
      const osc = this.oscs[i];
      if (osc.type !== o.wave) osc.type = o.wave;
      osc.frequency.setTargetAtTime(f * o.ratio * Math.pow(2, o.fine / 1200), t, 0.01);
    });
    this.depths.forEach(({ gain, mod }) => {
      const o = patch.ops[mod];
      gain.gain.setTargetAtTime(modIndex(o.level) * f * o.ratio * Math.pow(2, o.fine / 1200), t, 0.01);
    });
    this.carriers.forEach(({ gain, op }) => gain.gain.setTargetAtTime(carrierAmp(patch.ops[op].level), t, 0.01));
    this.out.gain.setTargetAtTime((patch.volume * 0.55) / Math.sqrt(this.carriers.length), t, 0.02);
    this.patch = { ...patch, ops: patch.ops.map((o, i) => ({ ...o, a: this.patch.ops[i].a, d: this.patch.ops[i].d, s: this.patch.ops[i].s, r: patch.ops[i].r })) };
  }

  release() {
    if (this.released) return;
    this.released = true;
    const ctx = this.e.ctx!;
    const t = ctx.currentTime;
    let longest = 0;
    this.patch.ops.forEach((o, i) => {
      const g = this.envs[i].gain;
      holdAt(g, t);
      g.setTargetAtTime(0, t, Math.max(0.01, o.r) / 4);
      longest = Math.max(longest, o.r);
    });
    const end = t + longest * 1.6 + 0.1;
    this.oscs.forEach((o) => o.stop(end));
    this.oscs[0].onended = () => this.out.disconnect();
  }

  kill() {
    const t = this.e.ctx!.currentTime;
    holdAt(this.out.gain, t);
    this.out.gain.setTargetAtTime(0, t, 0.01);
    this.oscs.forEach((o) => {
      try {
        o.stop(t + 0.08);
      } catch {
        /* already stopped */
      }
    });
    this.oscs[0].onended = () => this.out.disconnect();
  }
}

export class Fm1Engine {
  ctx: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  voiceBus: GainNode | null = null;
  modBus: GainNode | null = null;
  private master: GainNode | null = null;
  private tremolo: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private dist: Distortion | null = null;
  private chorus: Chorus | null = null;
  private phaser: Phaser | null = null;
  private echo: Echo | null = null;
  private reverb: Reverb | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoPitch: GainNode | null = null;
  private lfoAmp: GainNode | null = null;
  private lfoFilter: GainNode | null = null;
  private bend: ConstantSourceNode | null = null;
  private voices = new Map<number, Voice>();
  private mono: Voice | null = null;
  private monoStack: number[] = [];
  private patch: Patch | null = null;
  private volume = 0.75;
  maxVoices = 8;

  /** Create the audio graph. Must be called from a user gesture. */
  start() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor({ latencyHint: 'interactive' });
    this.ctx = ctx;
    this.voiceBus = ctx.createGain();
    this.modBus = ctx.createGain();
    this.tremolo = ctx.createGain();
    this.filter = ctx.createBiquadFilter();
    this.dist = new Distortion(ctx);
    this.chorus = new Chorus(ctx);
    this.phaser = new Phaser(ctx);
    this.echo = new Echo(ctx);
    this.reverb = new Reverb(ctx);
    this.master = ctx.createGain();
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.15;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;

    this.voiceBus.connect(this.tremolo).connect(this.filter).connect(this.dist.input);
    this.dist.output.connect(this.chorus.input);
    this.chorus.output.connect(this.phaser.input);
    this.phaser.output.connect(this.echo.input);
    this.echo.output.connect(this.reverb.input);
    this.reverb.output.connect(this.master).connect(limiter).connect(this.analyser).connect(ctx.destination);

    this.lfo = ctx.createOscillator();
    this.lfoPitch = ctx.createGain();
    this.lfoAmp = ctx.createGain();
    this.lfoFilter = ctx.createGain();
    this.lfo.connect(this.lfoPitch).connect(this.modBus);
    this.lfo.connect(this.lfoAmp).connect(this.tremolo.gain);
    this.lfo.connect(this.lfoFilter).connect(this.filter.detune);
    this.lfo.start();
    this.bend = ctx.createConstantSource();
    this.bend.offset.value = 0;
    this.bend.connect(this.modBus);
    this.bend.start();

    this.setVolume(this.volume);
    if (this.patch) this.applyPatch(this.patch);
  }

  get running() {
    return !!this.ctx && this.ctx.state === 'running';
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(Math.pow(v, 2) * 1.2, this.ctx.currentTime, 0.02);
  }

  /** Pitch offset in cents for every voice (master tune + bend). */
  setBend(cents: number) {
    if (this.bend && this.ctx) this.bend.offset.setTargetAtTime(cents, this.ctx.currentTime, 0.02);
  }

  setPatch(p: Patch) {
    this.patch = p;
    if (this.ctx) this.applyPatch(p);
  }

  private applyPatch(p: Patch) {
    const t = this.ctx!.currentTime;
    const f = p.fx.filter;
    this.filter!.type = f.on ? f.type : 'lowpass';
    this.filter!.frequency.setTargetAtTime(f.on ? f.cutoff : 20000, t, 0.02);
    this.filter!.Q.setTargetAtTime(f.on ? f.reso : 0.5, t, 0.02);
    this.dist!.set(p.fx.distortion);
    this.chorus!.set(p.fx.chorus);
    this.phaser!.set(p.fx.phaser);
    this.echo!.set(p.fx.delay);
    this.reverb!.set(p.fx.reverb);
    this.applyLfo(p.lfo);
    for (const v of this.voices.values()) v.update(p);
    this.mono?.update(p);
  }

  private applyLfo(l: Lfo) {
    const t = this.ctx!.currentTime;
    if (this.lfo!.type !== l.wave) this.lfo!.type = l.wave;
    this.lfo!.frequency.setTargetAtTime(l.rate, t, 0.05);
    this.lfoPitch!.gain.setTargetAtTime(l.target === 'pitch' ? l.depth * 120 : 0, t, 0.05);
    this.lfoAmp!.gain.setTargetAtTime(l.target === 'amp' ? l.depth * 0.5 : 0, t, 0.05);
    this.lfoFilter!.gain.setTargetAtTime(l.target === 'filter' ? l.depth * 3600 : 0, t, 0.05);
    this.tremolo!.gain.setTargetAtTime(l.target === 'amp' ? 1 - l.depth * 0.5 : 1, t, 0.05);
  }

  noteOn(midi: number) {
    if (!this.ctx || !this.patch) return;
    const p = this.patch;
    if (p.mono) {
      this.monoStack = this.monoStack.filter((n) => n !== midi);
      this.monoStack.push(midi);
      if (this.mono && !this.mono.released) this.mono.glideTo(midi, p.glide);
      else {
        this.mono?.kill();
        this.mono = new Voice(this, midi, p);
      }
      return;
    }
    this.voices.get(midi)?.kill();
    if (this.voices.size >= this.maxVoices) {
      const [oldest] = this.voices.keys();
      this.voices.get(oldest)?.kill();
      this.voices.delete(oldest);
    }
    this.voices.set(midi, new Voice(this, midi, p));
  }

  noteOff(midi: number) {
    if (!this.ctx) return;
    if (this.patch?.mono) {
      this.monoStack = this.monoStack.filter((n) => n !== midi);
      if (!this.mono) return;
      if (this.monoStack.length) {
        if (this.mono.midi === midi) this.mono.glideTo(this.monoStack[this.monoStack.length - 1], this.patch.glide);
      } else this.mono.release();
      return;
    }
    const v = this.voices.get(midi);
    if (v) {
      v.release();
      this.voices.delete(midi);
    }
  }

  allOff() {
    for (const v of this.voices.values()) v.release();
    this.voices.clear();
    this.mono?.release();
    this.monoStack = [];
  }
}
