'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Rotary encoder. Drag (up or right turns clockwise), scroll, or use the
 * arrow keys. `onTurn` gets whole steps; fast drags are accelerated. With
 * `angle` set it shows a pointer at that angle (MASTER); otherwise it's an
 * endless encoder whose knurling turns with you.
 */
export default function Knob({
  label,
  x,
  y,
  size = 64,
  onTurn,
  angle,
  valueText,
  labelColor,
  onStart,
}: {
  label: string;
  x: number;
  y: number;
  size?: number;
  onTurn: (steps: number) => void;
  angle?: number;
  valueText?: string;
  labelColor: string;
  onStart?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [spin, setSpin] = useState(0);
  const drag = useRef<{ x: number; y: number; acc: number; t: number } | null>(null);
  const turnRef = useRef(onTurn);
  turnRef.current = onTurn;

  const step = (n: number) => {
    if (!n) return;
    setSpin((s) => s + n * 9);
    turnRef.current(n);
  };

  // Non-passive wheel so the page doesn't scroll while turning.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      acc += -e.deltaY - e.deltaX;
      const n = Math.trunc(acc / 40);
      if (n) {
        acc -= n * 40;
        step(Math.max(-4, Math.min(4, n)));
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const d = size / 14; // cqw
  return (
    <>
      <span
        className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap font-pixel uppercase"
        style={{ left: `${(x / 1400) * 100}%`, top: `${((y - size / 2 - 52) / 848) * 100}%`, fontSize: '1.45cqw', color: labelColor, letterSpacing: '0.04em' }}
      >
        {label}
      </span>
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuetext={valueText}
        aria-valuenow={angle !== undefined ? Math.round(((angle + 135) / 270) * 100) : Math.round(spin / 9)}
        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-accent active:cursor-grabbing"
        style={{ left: `${(x / 1400) * 100}%`, top: `${(y / 848) * 100}%`, width: `${d}cqw`, height: `${d}cqw` }}
        onPointerDown={(e) => {
          onStart?.();
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, acc: 0, t: performance.now() };
        }}
        onPointerMove={(e) => {
          const s = drag.current;
          if (!s) return;
          const dx = e.clientX - s.x;
          const dy = e.clientY - s.y;
          const now = performance.now();
          const speed = Math.hypot(dx, dy) / Math.max(1, now - s.t);
          s.x = e.clientX;
          s.y = e.clientY;
          s.t = now;
          s.acc += (dx - dy) * (speed > 1.2 ? 2.5 : speed > 0.5 ? 1.5 : 1);
          const n = Math.trunc(s.acc / 7);
          if (n) {
            s.acc -= n * 7;
            step(n);
          }
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onKeyDown={(e) => {
          const map: Record<string, number> = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 };
          if (map[e.key]) {
            e.preventDefault();
            onStart?.();
            step(map[e.key]);
          }
        }}
      >
        {/* Shadow + knurled skirt */}
        <span className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0.5cqw 1cqw rgb(0 0 0 / 0.55), 0 0.15cqw 0.2cqw rgb(0 0 0 / 0.6)' }} />
        <span
          className="absolute inset-0 rounded-full transition-transform duration-75"
          style={{
            transform: `rotate(${angle ?? spin}deg)`,
            background: 'repeating-conic-gradient(#0e0e0f 0deg 5deg, #2c2c2e 5deg 10deg)',
            maskImage: 'radial-gradient(circle, transparent 58%, black 60%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 58%, black 60%)',
          }}
        />
        {/* Cap */}
        <span
          className="absolute inset-[16%] rounded-full"
          style={{ background: 'radial-gradient(circle at 35% 30%, #3b3b3d 0%, #161617 55%, #0b0b0c 100%)', boxShadow: 'inset 0 0.1cqw 0.15cqw rgb(255 255 255 / 0.12)' }}
        />
        {angle !== undefined ? (
          <span className="absolute inset-0 transition-transform duration-75" style={{ transform: `rotate(${angle}deg)` }}>
            <span className="absolute left-1/2 top-[19%] h-[16%] w-[12%] -translate-x-1/2 rounded-full bg-white shadow-[0_0_4px_white]" />
          </span>
        ) : null}
      </div>
    </>
  );
}
