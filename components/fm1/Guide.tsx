/** How to drive the virtual FM-1. */
const GROUPS = [
  {
    title: 'Knobs',
    items: [
      ['MASTER', 'Volume'],
      ['SELECT', 'Browse presets, or pick the operator / effect / save slot on that page'],
      ['PRESETS', 'Step through the 26 demo patches'],
      ['ALGORITHM', 'Switch between 8 operator algorithms (diagram on screen)'],
      ['KNOB1–4', 'Whatever the bottom row of the screen shows'],
    ],
  },
  {
    title: 'Buttons',
    items: [
      ['EDIT · ENV', 'Operator ratio, fine, level, wave · its envelope'],
      ['LFO · FX · GLO', 'Modulation · six effects (SEL toggles one) · glide, tune, mode, tempo'],
      ['ARP', 'Arpeggiator on/off: hold notes and it plays them'],
      ['SEQ · REC · PLAY', '16-step sequencer: REC writes notes (SEL = rest), PLAY runs it'],
      ['SAVE · HOME', 'Store your edit in a slot (kept in this browser) · back home'],
    ],
  },
  {
    title: 'Keys',
    items: [
      ['Keybed', 'Tap, hold or slide across the keys; several at once works'],
      ['SEL + top key', 'OP1–OP6 select an operator, MONO/POLY, GLO toggles glide, hold PIT to bend'],
      ['OCT− · OCT+', 'Shift the keybed ±3 octaves'],
      ['Computer', 'A S D F G H J K L ; play, W E T Y U O P sharps, Z / X octave'],
    ],
  },
];

export default function Guide() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {GROUPS.map((g) => (
        <div key={g.title} className="card p-6">
          <p className="eyebrow">{g.title}</p>
          <dl className="mt-4 space-y-3">
            {g.items.map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-accent">{k}</dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-brand-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
