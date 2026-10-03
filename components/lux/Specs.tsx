import Reveal from './Reveal';

const SPECS: Array<[string, string]> = [
  ['Synthesis', 'FM, 6 operators, selectable algorithms'],
  ['Presets', '128'],
  ['Controls', 'Master, Select, Presets and Algorithm knobs + 4 assignable knobs'],
  ['Display', 'Color screen'],
  ['Effects', 'Filter, reverb, delay, distortion, chorus, phaser'],
  ['Performance', 'Arpeggiator, sequencer, record, play/stop'],
  ['Voice modes', 'Mono, poly, glide, pitch'],
  ['Keys', 'Two-row silicone keybed with octave up/down'],
  ['Speaker', 'Built-in'],
  ['Power', 'Rechargeable battery, included'],
  ['Colors', 'Orange, Green, Blue, Gray, Dark, Purple'],
];

/** Spec sheet: only what the listing and the printed panel confirm. */
export default function Specs() {
  return (
    <dl className="card divide-y divide-white/[0.06] p-0">
      {SPECS.map(([k, v], i) => (
        <Reveal key={k} delay={i * 30} className="grid gap-1 px-6 py-5 sm:grid-cols-[220px_1fr] sm:gap-6 sm:px-8">
          <dt className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand-muted sm:pt-0.5">{k}</dt>
          <dd className="text-[15px] text-brand-ink">{v}</dd>
        </Reveal>
      ))}
    </dl>
  );
}
