'use client';

import dynamic from 'next/dynamic';

/** Loads the instrument only in the browser (Web Audio), with a panel-shaped placeholder. */
const LazyFm1 = dynamic(() => import('./Fm1'), {
  ssr: false,
  loading: () => (
    <div className="w-full animate-pulse rounded-[5vw] bg-white/[0.04] sm:rounded-[40px]" style={{ aspectRatio: '1400 / 848' }} aria-label="Loading the virtual FM-1" />
  ),
});

export default LazyFm1;
