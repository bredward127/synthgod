/**
 * Splits text into masked words that rise into place when the closest
 * [data-reveal] ancestor is shown. Use inside a Reveal (or pass `reveal`).
 */
export default function SplitWords({ text, offset = 0, className = '' }: { text: string; offset?: number; className?: string }) {
  const words = text.split(' ').filter(Boolean);
  return (
    <span className={`split ${className}`}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="w" aria-hidden="true">
          <span style={{ ['--i' as string]: i + offset }}>{w}</span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
      <span className="sr-only">{text}</span>
    </span>
  );
}
