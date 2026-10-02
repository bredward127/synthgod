import {
  BatteryCharging,
  Cable,
  Gauge,
  Monitor,
  Music2,
  Palette,
  Repeat,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  Waves,
} from 'lucide-react';
import { buildLink } from '@/lib/links';

/**
 * M-VAVE FM-1 landing page. Every claim below comes from the AliExpress
 * listing title/specs or from what is printed on the panel in the product
 * photos. Do not add specs (MIDI, battery hours, dimensions) until confirmed.
 *
 * Set NEXT_PUBLIC_BUY_URL to your affiliate link (AliExpress Portals) or your
 * own checkout. NEXT_PUBLIC_BUY_SUBPARAM optionally names the query parameter
 * that carries per-button sub-tracking.
 */
const BUY_URL = process.env.NEXT_PUBLIC_BUY_URL?.trim() || 'https://www.aliexpress.com/item/3256812462446286.html';
const SUB_PARAM = process.env.NEXT_PUBLIC_BUY_SUBPARAM?.trim() || undefined;

export const buyHref = (slot: string) => buildLink({ kind: 'url', url: BUY_URL }, { sub: ['fm1', slot], subParam: SUB_PARAM });

const buy = (id: string, label = 'Check price on AliExpress') => ({ label, href: buyHref(id), id, sponsored: true });

export type Colorway = { id: string; name: string; body: string; image?: string; swatch: [string, string] };

/** Colorways offered on the listing. Purple has no photo here; it shows a swatch only. */
export const colorways: Colorway[] = [
  { id: 'orange', name: 'Orange', body: 'Orange body, brick-red keys', image: '/images/fm1-orange.jpg', swatch: ['#F25A1D', '#B9432E'] },
  { id: 'green', name: 'Green', body: 'Black body, mint keys', image: '/images/fm1-green.jpg', swatch: ['#2B2B2E', '#7BD6C3'] },
  { id: 'blue', name: 'Blue', body: 'Cream body, slate-blue keys', image: '/images/fm1-blue.jpg', swatch: ['#F1EEE6', '#4E6E95'] },
  { id: 'gray', name: 'Gray', body: 'Cream body, charcoal keys', image: '/images/fm1-gray.jpg', swatch: ['#E9E3DA', '#45484C'] },
  { id: 'dark', name: 'Dark', body: 'Charcoal body, black keys', image: '/images/fm1-dark.jpg', swatch: ['#3A3A3D', '#141416'] },
  { id: 'purple', name: 'Purple', body: 'Photo not shown here: see the listing', swatch: ['#8B6CD9', '#5B3FB4'] },
];

export const landing = {
  hero: {
    eyebrow: 'M-VAVE FM-1 · Handheld FM synth',
    title: 'Six-operator FM synthesis you can hold in your hands',
    accent: 'hold in your hands',
    subtitle:
      'A battery-powered FM synth with 128 presets, a built-in speaker, a color screen and real knobs. No laptop, no cables: turn it on and play.',
    cta: buy('hero'),
    secondary: { label: 'Pick a color', href: '#colors', id: 'hero-colors' },
    bullets: ['128 presets', 'Built-in speaker', 'Rechargeable battery'],
    imageUrl: '/images/fm1-orange.jpg',
    imageAlt: 'M-VAVE FM-1 synthesizer in orange, top view: screen, eight knobs, function buttons and a two-row silicone keybed',
  },
  proof: [
    { icon: Sparkles, label: '128 factory presets' },
    { icon: Volume2, label: 'Built-in speaker' },
    { icon: BatteryCharging, label: 'Rechargeable battery included' },
    { icon: Palette, label: '6 colorways' },
  ],
  problem: {
    title: 'Why FM usually stays on the desk',
    problems: [
      { icon: Monitor, title: 'Menu diving', body: 'Classic FM editing means paging through tiny displays to reach one parameter.' },
      { icon: Cable, title: 'Tied to a setup', body: 'Soft synths need a computer, an interface and headphones before you hear a note.' },
      { icon: Waves, title: 'Hard to learn by ear', body: 'FM is math-heavy. Without hands-on control it is hard to hear what each change does.' },
    ],
    solution: {
      title: 'The FM-1 puts the operators under your fingers',
      body: 'The six operators are labeled right on the keybed, with a dedicated algorithm knob, four assignable knobs and a color screen. A speaker and battery mean it works on the couch, on the train or at your desk.',
    },
  },
  features: [
    { icon: Waves, title: '6 operators + algorithm knob', body: 'Pick an operator from the keybed (OP1–OP6) and switch algorithms with a dedicated knob.' },
    { icon: SlidersHorizontal, title: 'Four assignable knobs', body: 'KNOB1–4 follow whichever page the screen is showing.' },
    { icon: Sparkles, title: 'Built-in effects', body: 'Filter, reverb, delay, distortion, chorus and phaser on the FX page.' },
    { icon: Repeat, title: 'Arp, sequencer, record', body: 'Dedicated ARP, SEQ, PLAY/STOP and REC buttons for patterns and loops.' },
    { icon: Gauge, title: 'Envelopes and LFO', body: 'ENV and LFO pages are one button press away, no menus to dig through.' },
    { icon: Music2, title: 'Mono, poly and glide', body: 'Switch voice modes and add glide and pitch control from the keybed.' },
  ],
  band: {
    title: 'The sound of the 80s, in a handheld box',
    body: 'FM gave us glassy electric pianos, bell tones and punchy basses. The FM-1 makes that sound something you can pick up and play anywhere.',
    highlight: 'pick up and play anywhere',
  },
  specs: {
    title: 'At a glance',
    subtitle: 'Only what the listing and the panel confirm.',
    columns: ['M-VAVE FM-1'],
    rows: [
      { label: 'Synthesis', values: ['FM, 6 operators'] },
      { label: 'Presets', values: ['128'] },
      { label: 'Speaker', values: ['Built-in'] },
      { label: 'Power', values: ['Rechargeable battery (included)'] },
      { label: 'Screen', values: ['Color display'] },
      { label: 'Effects', values: ['Filter, reverb, delay, distortion, chorus, phaser'] },
      { label: 'Performance', values: ['Arpeggiator, sequencer, record'] },
      { label: 'Colors', values: ['Orange, Green, Blue, Gray, Dark, Purple'] },
    ],
  },
  steps: [
    { title: 'Pick a color and order', body: 'Choose your colorway on AliExpress. It ships from China; the seller shows the delivery estimate at checkout.' },
    { title: 'Charge it and switch on', body: 'Scroll through 128 presets with the PRESETS knob and play straight from the speaker.' },
    { title: 'Make it yours', body: 'Change the algorithm, edit operators, add effects, then save your sound or record a sequence.' },
  ],
  faq: [
    {
      q: 'Is this the official M-VAVE store?',
      a: 'No. SynthGod is an independent page about the FM-1. The buy buttons go to the product on AliExpress, where the seller handles your order, payment, shipping and returns.',
    },
    {
      q: 'How long does shipping take?',
      a: 'It ships from China. When we checked the listing in October 2026 it showed a low shipping fee and delivery in about one to two weeks to the US, but the seller sets this: check the estimate at checkout for your address.',
    },
    {
      q: 'What about returns?',
      a: 'AliExpress buyer protection and the seller’s return policy apply. Read both on the product page before you order; we can’t accept returns ourselves.',
    },
    {
      q: 'Does it have MIDI, USB audio or a headphone output?',
      a: 'The listing we checked does not spell out connectivity, so we don’t claim it here. Check the seller’s spec images or message the seller before buying if you need a particular port.',
    },
    {
      q: 'How long does the battery last?',
      a: 'The listing confirms a rechargeable battery is included but doesn’t give a runtime, so we won’t guess one.',
    },
    {
      q: 'Is FM hard for beginners?',
      a: 'You don’t have to program anything to start: play the 128 presets, then turn the four assignable knobs to hear what each page does.',
    },
    {
      q: 'Why don’t you show the price?',
      a: 'AliExpress prices change often with sales, coupons and colorway. The button takes you to the current price.',
    },
  ],
  promise: {
    eyebrow: 'Our promise',
    title: 'Only facts we can check',
    body: 'Every feature on this page comes from the product listing or from what is printed on the panel in the product photos. No made-up reviews, no fake countdowns, and buy links are always labeled.',
  },
  final: {
    title: 'Six operators. One handheld box.',
    body: '128 presets, a speaker and a battery: FM synthesis wherever you are.',
    cta: buy('final'),
  },
};
