import Link from 'next/link';
import { ArrowRight, BookOpen, Orbit, Rocket, Users } from 'lucide-react';

import { BookCarousel } from '@/components/book-carousel';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getPrivateerHomeData } from '@/lib/appwrite';

const discoveryCards = [
  {
    id: 'universe',
    icon: Orbit,
    title: 'Explore the universe',
    description: 'Planets, factions, and the forces that shape the galaxy.',
    action: 'Learn more',
    href: '/books',
  },
  {
    id: 'characters',
    icon: Users,
    title: 'Meet the characters',
    description:
      'Liam, his crew, and the allies and adversaries they encounter.',
    action: 'Meet the crew',
    href: '/books',
  },
  {
    id: 'extras',
    icon: Rocket,
    title: 'Ships & gear',
    description: 'From the Sterra to the latest acquisitions.',
    action: 'Take a look',
    href: '/books',
  },
  {
    id: 'reading-order',
    icon: BookOpen,
    title: 'Reading order',
    description: 'New to the series? We’ll get you started.',
    action: 'View the guide',
    href: '/books',
  },
] as const;

export default async function Home() {
  const { series, books } = await getPrivateerHomeData();
  const heroBook = books[0];

  return (
    <main>
      <SiteHeader series={series} />

      <section id="top" className="hero">
        <div className="hero-copy">
          <p className="eyebrow">The Privateer Tales</p>
          <h1>Adventure has a different flag.</h1>
          <p className="hero-description">{series.description}</p>

          {heroBook ? (
            <div className="hero-actions">
              <Link className="button" href={`/books/${heroBook.slug}`}>
                <span>
                  Start the series
                  <small>
                    {heroBook.title} — Book {heroBook.series_number}
                  </small>
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link className="text-link" href="/books">
                View all books <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </div>

        <div className="hero-feature">
          {heroBook ? (
            <div
              className="hero-cover-wrap"
              aria-label={`Featured book: ${heroBook.title}`}
            >
              <span className="cover-glow" aria-hidden="true" />
              <img
                className="hero-kindle"
                src="/images/rookie-privateer-kindle.png"
                alt={`${heroBook.title} shown on an e-reader`}
                width="1024"
                height="1536"
              />
            </div>
          ) : null}

          <p className="hero-manifesto" aria-label="Series themes">
            <span className="manifesto-line">
              Freedom <span className="manifesto-separator">•</span> Profit{' '}
              <span className="manifesto-separator">•</span> Friends{' '}
              <span className="manifesto-separator">•</span> Trouble{' '}
              <span className="manifesto-separator">•</span> Repeat
            </span>
          </p>

          <div className="hero-review">
            <p>“Fast, fun, and impossible to put down.”</p>
            <span>— Reader review</span>
          </div>
        </div>
      </section>

      <section id="books" className="book-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{series.card_tag || 'The Series'}</p>
            <h2>{books.length} books. A universe of opportunity.</h2>
          </div>
          <div className="section-note">
            <p>{series.card_meta}</p>
            <Link className="text-link" href="/books">
              View reading order <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>

        <BookCarousel books={books} />
      </section>

      <section className="discovery-grid" aria-label="Explore Privateer Tales">
        {discoveryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article id={card.id} className="discovery-card" key={card.id}>
              <Icon aria-hidden="true" strokeWidth={1.35} />
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <Link className="text-link" href={card.href}>
                {card.action} <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </section>

      <section className="frontier-banner">
        <div className="frontier-statement">
          <h2>Some people follow orders. Others chart their own course.</h2>
          <span aria-hidden="true" />
        </div>
        <blockquote>
          “Jamie McFarlane delivers space adventure the way it should be — big,
          bold, and endlessly entertaining.”
          <cite>— Reader review</cite>
        </blockquote>
      </section>

      <SiteFooter series={series} />
    </main>
  );
}
