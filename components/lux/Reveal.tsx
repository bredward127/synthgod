/** Wrapper that fades/lifts its content in on scroll. `delay` in ms staggers siblings. */
export default function Reveal({
  as: Tag = 'div',
  delay = 0,
  className = '',
  children,
}: {
  as?: 'div' | 'li' | 'section' | 'article' | 'p' | 'h2';
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag data-reveal="" className={className} style={{ ['--delay' as string]: `${delay}ms` }}>
      {children}
    </Tag>
  );
}
