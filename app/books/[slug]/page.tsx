import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Headphones } from 'lucide-react';
import { notFound } from 'next/navigation';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import {
  analyticsClick,
  analyticsView,
  bookAnalyticsItem,
} from '@/lib/analytics';
import { getPrivateerBookBySlug } from '@/lib/appwrite';

type BookPageProps = { params: Promise<{ slug: string }> };

function formatDate(value: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { book } = await getPrivateerBookBySlug(slug);

  if (!book) return { title: 'Book not found | Privateer Tales' };

  return {
    title: `${book.title} | Privateer Tales`,
    description: book.card_description || book.tagline,
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;
  const { series, books, book } = await getPrivateerBookBySlug(slug);

  if (!book) notFound();

  const index = books.findIndex((candidate) => candidate.id === book.id);
  const previousBook = index > 0 ? books[index - 1] : null;
  const nextBook = index < books.length - 1 ? books[index + 1] : null;
  const paragraphs = book.blurb.split(/\n\s*\n/).filter(Boolean);

  return (
    <main>
      <SiteHeader
        series={series}
        firstBookSlug={books[0]?.slug}
        active="books"
      />
      <article
        className="book-detail"
        {...analyticsView('view_item', {
          items: [bookAnalyticsItem(book)],
        })}
      >
        <div className="detail-cover-wrap">
          <img
            src={book.cover_url}
            alt={book.cover_alt}
            width="600"
            height="900"
            className="detail-cover"
          />
        </div>

        <div className="detail-copy">
          <Link className="back-link" href="/books">
            <ArrowLeft aria-hidden="true" /> Complete reading order
          </Link>
          <p className="eyebrow">Privateer Tales · Book {book.series_number}</p>
          <h1>{book.title}</h1>
          {book.tagline ? (
            <p className="detail-tagline">{book.tagline}</p>
          ) : null}
          {book.release_date ? (
            <p className="detail-date">
              Published {formatDate(book.release_date)}
            </p>
          ) : null}

          <div className="detail-blurb">
            {paragraphs.map((paragraph, paragraphIndex) => (
              <p key={`${book.id}-${paragraphIndex}`}>{paragraph}</p>
            ))}
          </div>

          <div className="detail-actions">
            {book.store_url ? (
              <a
                className="button"
                href={book.store_url}
                target="_blank"
                rel="noopener noreferrer"
                {...analyticsClick('retailer_click', {
                  item_id: book.id,
                  item_name: book.title,
                  book_number: book.series_number,
                  format: 'book',
                  retailer: book.store_label || 'Book retailer',
                })}
              >
                <BookOpen aria-hidden="true" />{' '}
                {book.store_label || 'Buy the book'}
              </a>
            ) : null}
            {book.audible_url ? (
              <a
                className="button button-secondary"
                href={book.audible_url}
                target="_blank"
                rel="noopener noreferrer"
                {...analyticsClick('retailer_click', {
                  item_id: book.id,
                  item_name: book.title,
                  book_number: book.series_number,
                  format: 'audiobook',
                  retailer: 'Audible',
                })}
              >
                <Headphones aria-hidden="true" /> Listen on Audible
              </a>
            ) : null}
          </div>
        </div>
      </article>

      <nav className="book-pagination" aria-label="Adjacent books">
        {previousBook ? (
          <Link
            href={`/books/${previousBook.slug}`}
            {...analyticsClick('select_item', {
              item_list_id: 'book_pagination',
              item_list_name: 'Book pagination',
              direction: 'previous',
              items: [bookAnalyticsItem(previousBook, index - 1)],
            })}
          >
            <ArrowLeft aria-hidden="true" />
            <span>
              Previous
              <strong>{previousBook.title}</strong>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {nextBook ? (
          <Link
            href={`/books/${nextBook.slug}`}
            {...analyticsClick('select_item', {
              item_list_id: 'book_pagination',
              item_list_name: 'Book pagination',
              direction: 'next',
              items: [bookAnalyticsItem(nextBook, index + 1)],
            })}
          >
            <span>
              Next
              <strong>{nextBook.title}</strong>
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <SiteFooter series={series} />
    </main>
  );
}
