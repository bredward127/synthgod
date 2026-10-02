import type { Metadata } from 'next';
import Script from 'next/script';
import ConsentBanner from '@/components/analytics/ConsentBanner';
import RouteEvents from '@/components/analytics/RouteEvents';
import VercelAnalytics from '@/components/analytics/VercelAnalytics';
import './globals.css';

// Replace with the real origin. Used for canonical and Open Graph URLs.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://example.com';
// Google tag ID (AW-… or G-…). Empty disables Google measurement entirely.
const GOOGLE_TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID?.trim() ?? '';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'SynthGod', template: '%s | SynthGod' },
  robots: { index: true, follow: true },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0C0C0E' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#0C0C0E]">
      <body className="flex min-h-screen flex-col">
        {children}
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
