import Reveal from './Reveal';
import SplitWords from './SplitWords';

/** Eyebrow + headline with an italic serif accent + optional body. */
export default function SectionTitle({
  eyebrow,
  title,
  accent,
  body,
  align = 'center',
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  body?: string;
  align?: 'center' | 'left';
}) {
  const center = align === 'center';
  return (
    <div className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'}>
      {eyebrow ? (
        <Reveal as="p" className={`eyebrow flex items-center gap-3 ${center ? 'justify-center' : ''}`}>
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-brand-accent" />
          {eyebrow}
          <span className={`h-px w-8 bg-gradient-to-l from-transparent to-brand-accent ${center ? '' : 'hidden'}`} />
        </Reveal>
      ) : null}
      <Reveal as="h2" delay={80} className="split-host mt-4 font-display text-[clamp(2.1rem,8.5vw,3.75rem)] font-semibold leading-[1.02] tracking-tightest text-brand-ink sm:mt-5">
        <SplitWords text={title} />{' '}
        {accent ? <SplitWords text={accent} offset={title.split(' ').length} className="font-serif font-normal italic tracking-normal text-brand-gold" /> : null}
      </Reveal>
      {body ? (
        <Reveal as="p" delay={160} className={`mt-5 text-[17px] leading-relaxed text-brand-muted ${center ? 'mx-auto max-w-xl' : ''}`}>
          {body}
        </Reveal>
      ) : null}
    </div>
  );
}
