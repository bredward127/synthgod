'use client';

/** Feeds the cursor position to every `.spotlight` card inside, for the hover glow. */
export default function SpotlightGroup({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={className}
      onPointerMove={(e) => {
        const cards = (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('.spotlight');
        cards.forEach((card) => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', `${e.clientX - r.left}px`);
          card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
      }}
    >
      {children}
    </div>
  );
}
