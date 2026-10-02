import { display, body } from '@/app/fonts';
import { site } from '@/data/site';
import AnnouncementBar from '@/components/sections/AnnouncementBar';

/** Chrome for section-built pages: preset theme, fonts, and disclosure strip. */
export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme={site.theme} className={`${display.variable} ${body.variable} flex flex-1 flex-col bg-brand-bg font-body text-brand-ink`}>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      {site.disclosure ? <AnnouncementBar text={site.disclosure} link={{ label: 'How that works', href: '/disclosure' }} /> : null}
      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}
