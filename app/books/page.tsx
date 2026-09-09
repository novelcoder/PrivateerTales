import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getPrivateerHomeData } from '@/lib/appwrite';

export const metadata: Metadata = {
  title: 'Reading Order | Privateer Tales',
  description: 'The complete Privateer Tales reading order by Jamie McFarlane.',
};

function formatDate(value: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

export default async function BooksPage() {
  const { series, books } = await getPrivateerHomeData();

  return (
    <main>
      <SiteHeader series={series} active="books" />
      <section className="page-masthead">
        <p className="eyebrow">The complete series</p>
        <h1>Reading order</h1>
        <p>{series.card_meta}</p>
      </section>

      <section
        className="catalog-grid"
        aria-label="Privateer Tales reading order"
      >
        {books.map((book) => (
          <article className="catalog-card" key={book.id}>
            <Link className="catalog-cover" href={`/books/${book.slug}`}>
              <img
                src={book.cover_thumb_url || book.cover_url}
                alt={book.cover_alt}
                width="600"
                height="900"
                loading={book.series_number > 8 ? 'lazy' : 'eager'}
              />
              <span className="catalog-number">Book {book.series_number}</span>
            </Link>
            <div className="catalog-copy">
              <p className="catalog-date">{formatDate(book.release_date)}</p>
              <h2>
                <Link href={`/books/${book.slug}`}>{book.title}</Link>
              </h2>
              {book.tagline ? (
                <p className="catalog-tagline">{book.tagline}</p>
              ) : null}
              {book.card_description ? <p>{book.card_description}</p> : null}
              <Link className="text-link" href={`/books/${book.slug}`}>
                View book <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </section>

      <SiteFooter series={series} />
    </main>
  );
}
