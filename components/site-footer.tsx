import Link from 'next/link';
import { Compass, ExternalLink } from 'lucide-react';

import { CookieSettingsButton } from '@/components/analytics-consent';
import type { SeriesRecord } from '@/lib/appwrite';

export function SiteFooter({ series }: { series: SeriesRecord }) {
  return (
    <footer className="site-footer" id="news">
      <Link className="brand footer-brand" href="/">
        <span className="brand-mark" aria-hidden="true">
          <Compass strokeWidth={1.25} />
        </span>
        <span>
          <strong>{series.name}</strong>
          <small>A series by Jamie McFarlane</small>
        </span>
      </Link>

      <div className="footer-join">
        <p className="footer-title">Join the crew</p>
        <p>News, new releases, and exclusive content from Jamie McFarlane.</p>
      </div>

      <div className="footer-legal" aria-label="Privacy links">
        <Link href="/privacy">Privacy &amp; cookies</Link>
        <CookieSettingsButton />
      </div>

      <a
        className="button footer-button"
        href="https://fickledragon.com/PrivateerTales"
        rel="noreferrer"
      >
        Visit Fickle Dragon <ExternalLink aria-hidden="true" />
      </a>
    </footer>
  );
}
