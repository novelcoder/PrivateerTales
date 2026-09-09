import Link from 'next/link';
import { Compass } from 'lucide-react';

import type { SeriesRecord } from '@/lib/appwrite';

export function SiteHeader({
  series,
  active = 'home',
}: {
  series: SeriesRecord;
  active?: 'home' | 'books';
}) {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Privateer Tales home">
        <span className="brand-mark" aria-hidden="true">
          <Compass strokeWidth={1.25} />
        </span>
        <span>
          <strong>{series.name}</strong>
          <small>{series.tagline}</small>
        </span>
      </Link>

      <nav className="primary-nav" aria-label="Primary navigation">
        <Link
          className={active === 'books' ? 'active' : undefined}
          href="/books"
        >
          Books
        </Link>
        <Link href="/#universe">The Universe</Link>
        <Link href="/#characters">Characters</Link>
        <Link href="/#extras">Extras</Link>
        <Link href="/#news">News</Link>
      </nav>

      <Link className="button button-small" href="/books">
        Start here
      </Link>
    </header>
  );
}
