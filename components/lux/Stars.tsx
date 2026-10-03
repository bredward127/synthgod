import { Star } from 'lucide-react';

/** Star row for a 0-5 rating; partial stars are clipped. */
export default function Stars({ rating, size = 16, className = '' }: { rating: number; size?: number; className?: string }) {
  return (
    <span className={`relative inline-flex ${className}`} role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <span className="flex gap-0.5 text-white/15">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} style={{ width: size, height: size }} className="fill-current" />
        ))}
      </span>
      <span className="absolute inset-0 flex gap-0.5 overflow-hidden text-brand-gold" style={{ width: `${(rating / 5) * 100}%` }}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} style={{ width: size, height: size }} className="shrink-0 fill-current" />
        ))}
      </span>
    </span>
  );
}
