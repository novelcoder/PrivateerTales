'use client';

import Link from 'next/link';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { BookRecord } from '@/lib/appwrite';

export function BookCarousel({ books }: { books: BookRecord[] }) {
  return (
    <Carousel
      className="series-carousel"
      opts={{ align: 'start', slidesToScroll: 2 }}
    >
      <CarouselContent className="series-carousel-track">
        {books.map((book) => (
          <CarouselItem className="series-slide" key={book.id}>
            <article className="book-card">
              <Link
                href={`/books/${book.slug}`}
                aria-label={`${book.title}, Book ${book.series_number}`}
              >
                <img
                  src={book.cover_thumb_url || book.cover_url}
                  alt={book.cover_alt}
                  width="600"
                  height="900"
                  loading={book.series_number > 6 ? 'lazy' : 'eager'}
                />
                <span>Book {book.series_number}</span>
              </Link>
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="series-arrow series-arrow-left" />
      <CarouselNext className="series-arrow series-arrow-right" />
    </Carousel>
  );
}
