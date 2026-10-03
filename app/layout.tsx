import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import ConsentBanner from '@/components/analytics/ConsentBanner';
import RouteEvents from '@/components/analytics/RouteEvents';
import VercelAnalytics from '@/components/analytics/VercelAnalytics';
import { body, display, mono, serif } from '@/app/fonts';
import { store } from '@/data/store';
import './globals.css';

// Your public origin, used for canonical and Open Graph URLs.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';
// Google tag ID (G-… or AW-…). Empty disables Google measurement entirely.
const GOOGLE_TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID?.trim() ?? '';

const description =
  'The M-VAVE FM-1: a handheld 6-operator FM synthesizer with 128 presets, a color screen, a built-in speaker and a rechargeable battery.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `M-VAVE FM-1 handheld FM synthesizer | ${store.name}`, template: `%s | ${store.name}` },
  description,
  robots: { index: true, follow: true },
  openGraph: { type: 'website', siteName: store.name, description, images: [{ url: '/og.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', images: ['/og.jpg'] },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#09090B' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${serif.variable} ${mono.variable}`}>
      <head>
        {/* Enables scroll-reveal styles only when JS runs, so content never stays hidden. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-screen flex-col">
        {children}
        <div aria-hidden="true" className="grain" />
        <ConsentBanner />
        <RouteEvents />
        <VercelAnalytics />
        {GOOGLE_TAG_ID ? (
          <>
            {/* Consent Mode defaults must run before gtag.js loads: everything starts denied. */}
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 });`,
              }}
            />
            <Script id="gtag-src" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`} />
            <Script id="gtag-init" strategy="afterInteractive">
              {`gtag('js', new Date()); gtag('config', '${GOOGLE_TAG_ID}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
