'use client';

import { useRef } from 'react';

/** Pulls its child gently toward the cursor (mouse only; touch is untouched). */
export default function Magnetic({ strength = 0.28, className = '', children }: { strength?: number; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <span
      ref={ref}
      className={`inline-flex transition-transform duration-500 ease-lux will-change-transform ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength * 1.3;
        ref.current.style.transitionDuration = '120ms';
        ref.current.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      }}
      onPointerLeave={() => {
        if (!ref.current) return;
        ref.current.style.transitionDuration = '';
        ref.current.style.transform = '';
      }}
    >
      {children}
    </span>
  );
}
