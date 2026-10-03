import { BatteryCharging, Monitor, Music2, SlidersHorizontal, Sparkles, Volume2 } from 'lucide-react';
import Reveal from './Reveal';
import SpotlightGroup from './SpotlightGroup';
import SectionTitle from './SectionTitle';

const FX = ['Filter', 'Reverb', 'Delay', 'Distortion', 'Chorus', 'Phaser'];
/** Pattern lit by the running step light (true = note). */
const STEPS = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0];

function Card({ className = '', delay = 0, children }: { className?: string; delay?: number; children: React.ReactNode }) {
  return (
    <Reveal delay={delay} className={`card spotlight p-6 sm:p-7 ${className}`}>
      {children}
    </Reveal>
  );
}

function CardText({ icon: Icon, title, body }: { icon?: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="relative">
      {Icon ? <Icon className="h-5 w-5 text-brand-accent" /> : null}
      <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-brand-ink">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-brand-muted">{body}</p>
    </div>
  );
}

export default function Bento() {
  return (
    <section id="features" className="scroll-mt-24 px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow="The instrument" title="Everything FM, nothing" accent="in the way." body="Every control has its own place on the panel, so you spend less time in menus and more time playing." />
        <SpotlightGroup className="mt-14 grid gap-4 lg:grid-cols-6">
          {/* Operators: hero card */}
          <Card className="flex min-h-[420px] flex-col justify-between lg:col-span-4 lg:row-span-2">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[url('/images/fm1-dark.webp')] bg-[length:170%] bg-[position:6%_100%] bg-no-repeat opacity-80 [mask-image:linear-gradient(180deg,transparent_38%,black_80%)]"
            />
            <div className="relative max-w-sm">
              <p className="eyebrow">OP1 — OP6</p>
              <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
                Six operators, <span className="font-serif font-normal italic text-brand-accent2">under your fingers.</span>
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-brand-muted">
                Pick an operator right from the keybed and swap FM algorithms with a dedicated knob. Hear every change as you make
                it.
              </p>
            </div>
          </Card>

          <Card delay={80} className="lg:col-span-2">
            <p className="eyebrow">Presets</p>
            <p className="mt-3 bg-gradient-to-b from-white to-white/30 bg-clip-text font-display text-[88px] font-semibold leading-none tracking-tightest text-transparent">
              128
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-brand-muted">Electric pianos, bells, basses, pads. Turn the PRESETS knob and play.</p>
          </Card>

          <Card delay={140} className="lg:col-span-2">
            <div className="flex h-12 items-end gap-1.5" aria-hidden="true">
              {[0.2, 0.55, 0.9, 0.4, 0.75, 0.3, 0.6].map((d, i) => (
                <span
                  key={i}
                  className="w-2.5 origin-bottom rounded-full bg-gradient-to-t from-brand-accent to-brand-accent2"
                  style={{ height: '100%', animation: `eq ${0.9 + d}s ease-in-out ${-d}s infinite` }}
                />
              ))}
            </div>
            <div className="mt-5 flex gap-3 text-brand-accent">
              <Volume2 className="h-5 w-5" />
              <BatteryCharging className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-brand-ink">Speaker and battery built in</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-brand-muted">Charge it, switch it on, play. Couch, train, desk.</p>
          </Card>

          <Card delay={60} className="lg:col-span-3">
            <Sparkles className="h-5 w-5 text-brand-accent" />
            <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-brand-ink">Six built-in effects</h3>
            <ul className="mt-5 flex flex-wrap gap-2">
              {FX.map((f) => (
                <li key={f} className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 font-mono text-[12px] text-brand-ink">
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[15px] leading-relaxed text-brand-muted">Shape a patch from dry and glassy to washed-out and wide on the FX page.</p>
          </Card>

          <Card delay={120} className="lg:col-span-3">
            <p className="eyebrow">ARP · SEQ · REC</p>
            <div className="mt-5 grid grid-cols-8 gap-1.5 sm:grid-cols-[repeat(16,minmax(0,1fr))]" aria-hidden="true">
              {STEPS.map((on, i) => (
                <span
                  key={i}
                  className={`aspect-square rounded-md ${on ? 'ring-1 ring-brand-accent/40' : ''}`}
                  style={{ animation: `seq-step 2.4s linear ${(i * 2.4) / 16}s infinite`, background: 'rgb(var(--line) / 0.08)' }}
                />
              ))}
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-brand-ink">Arpeggiator, sequencer, recorder</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-brand-muted">Dedicated buttons to arpeggiate chords, program patterns and record loops.</p>
          </Card>

          <Card delay={40} className="lg:col-span-2">
            <CardText icon={Monitor} title="Color screen" body="Preset names, pages and parameter values at a glance." />
          </Card>
          <Card delay={100} className="lg:col-span-2">
            <CardText icon={Music2} title="Mono, poly, glide" body="Switch voice modes and add glide and pitch control from the keybed." />
          </Card>
          <Card delay={160} className="lg:col-span-2">
            <CardText icon={SlidersHorizontal} title="Four assignable knobs" body="KNOB1–4 follow whichever page is on screen, plus ENV and LFO pages one press away." />
          </Card>
        </SpotlightGroup>
      </div>
    </section>
  );
}
