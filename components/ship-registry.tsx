'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';

type RegistryBook = {
  id: string;
  title: string;
  order: number;
};

type RegistrySource = {
  bookId: string;
  chapter: string;
  location: string;
  paragraph?: string;
  evidence: string;
};

type RegistryFact = {
  category: string;
  value: unknown;
  unit?: string;
  confidence?: string;
  source: number;
  corroboratingSources?: number[];
  notes?: string;
  effectiveThroughLocation?: string;
};

type RegistryShip = {
  id: string;
  name: string;
  nameStatus: 'canonical' | 'assigned_descriptive';
  aliases: string[];
  sourceBookIds: string[];
  firstAppearance: number;
  labelProvenance?: {
    rationale: string;
    source: number;
  };
  facts: RegistryFact[];
};

type RegistryMention = {
  id: string;
  shipId: string;
  source: number;
  mentionType: 'exact_name' | 'descriptive_reference';
  attributionNote?: string;
};

type RegistryData = {
  books: RegistryBook[];
  sources: RegistrySource[];
  ships: RegistryShip[];
  mentions: RegistryMention[];
  scopeNote: string;
};

type DetailSection = 'Overview' | 'Specifications' | 'History' | 'Sources';

const sections: DetailSection[] = [
  'Overview',
  'Specifications',
  'History',
  'Sources',
];

const vesselTypes: Record<string, string> = {
  'ship-000001': 'General Astral CA12 cutter',
  'ship-000002': 'Naval corvette',
  'ship-000003': 'Naval destroyer',
  'ship-000004': 'North American naval cruiser',
  'ship-000005': 'Family trading freighter',
  'ship-000006': 'General Astral A20-402 freighter tug',
  'ship-000007': 'Naval frigate',
  'ship-000008': 'Fujitsu FF718 freighter tug',
  'ship-000009': 'General Astral CA-08 cutter',
  'ship-000012': 'Cutter',
  'ship-000013': 'Russian-made frigate',
  'ship-000014': 'Asteroid-moving ore hauler',
};

const essentialCategories = [
  [
    'class_and_model',
    'builder_and_model',
    'vessel_type',
    'vessel_type_and_configuration',
    'vessel_type_and_role',
    'launch_and_role',
  ],
  ['length', 'mass', 'approximate_mass', 'full_crew_complement'],
  ['captain', 'commanding_officer', 'regular_crew'],
  [
    'ownership',
    'prize_award',
    'ownership_award',
    'operational_affiliation',
    'affiliation',
    'retrospective_use',
  ],
];

const outcomePattern =
  /end_of_book|final_recovery_and_status|final_naval_report|combat_outcome|destruction|release_agreement|retrospective_use/;

function label(value: string) {
  const words = value.replaceAll('_', ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function factGroup(fact: RegistryFact) {
  if (
    /naming|name_origin|rejected|former_|prize|ownership|capture|initial_|condition|missing_|refit|repair|replacement|damage|overhaul|end_of_book|registration|disposition|purchase|temporary_brig|engine_overdrive|destruction|wreck|surrender|collision|combat_outcome|final_|recovery|release_agreement|disengagement|retrospective|bombardment|_loss|_status|planned_transport/.test(
      fact.category,
    )
  ) {
    return 'History';
  }
  if (
    /captain|commanding_officer|crew|officer|engineer|steward|marine_security|personnel|affiliation/.test(
      fact.category,
    )
  ) {
    return 'People & affiliation';
  }
  if (
    /armament|turret|missile|armory|defense|tactical|fire_resistance|protective|combat_/.test(
      fact.category,
    )
  ) {
    return 'Weapons & defenses';
  }
  if (
    /computer|sensor|communications|navigation|software|system|remote_coordination|security/.test(
      fact.category,
    )
  ) {
    return 'Systems & equipment';
  }
  return 'Design & capabilities';
}

function RegistryValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return value.map((item, index) => (
      <Fragment key={index}>
        {index ? <span className="registry-value-separator"> · </span> : null}
        <RegistryValue value={item} />
      </Fragment>
    ));
  }

  if (value && typeof value === 'object') {
    return (
      <span className="registry-value-list">
        {Object.entries(value).map(([key, item]) => (
          <span className="registry-value-line" key={key}>
            <span className="registry-value-key">{label(key)}:</span>
            <RegistryValue value={item} />
          </span>
        ))}
      </span>
    );
  }

  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value ?? '');
}

export function ShipRegistry() {
  const [data, setData] = useState<RegistryData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<'favorites' | 'all'>('favorites');
  const [selectedId, setSelectedId] = useState('ship-000001');
  const [favorites, setFavorites] = useState(
    () => new Set(['ship-000001', 'ship-000002']),
  );
  const [section, setSection] = useState<DetailSection>('Overview');
  const [editingFavorites, setEditingFavorites] = useState(false);

  useEffect(() => {
    let active = true;

    fetch('/data/ship-registry.json')
      .then((response) => {
        if (!response.ok) throw new Error('Registry data failed to load');
        return response.json() as Promise<RegistryData>;
      })
      .then((registryData) => {
        if (active) setData(registryData);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const books = useMemo(
    () => new Map(data?.books.map((book) => [book.id, book]) ?? []),
    [data],
  );

  const visibleShips = useMemo(
    () =>
      data?.ships.filter(
        (ship) => filter === 'all' || favorites.has(ship.id),
      ) ?? [],
    [data, favorites, filter],
  );

  useEffect(() => {
    if (
      visibleShips.length &&
      !visibleShips.some((ship) => ship.id === selectedId)
    ) {
      setSelectedId(visibleShips[0].id);
      setSection('Overview');
    }
  }, [selectedId, visibleShips]);

  if (loadError) {
    return (
      <section className="ship-registry registry-message" role="alert">
        <p className="eyebrow">Ship registry</p>
        <h1>The registry is temporarily unavailable.</h1>
        <p>Please reload the page to try again.</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="ship-registry registry-message" aria-live="polite">
        <p className="eyebrow">Ship registry</p>
        <h1>Opening the registry…</h1>
      </section>
    );
  }

  const registry = data;
  const selectedShip = data.ships.find((ship) => ship.id === selectedId);
  const bookTitle = (bookId: string) => books.get(bookId)?.title ?? bookId;
  const bookLabel = (bookId: string) => {
    const book = books.get(bookId);
    return `Book ${String(book?.order ?? 0).padStart(2, '0')} · ${bookTitle(bookId)}`;
  };
  const sourceFor = (sourceIndex: number) => data.sources[sourceIndex];
  const compareSources = (left: RegistrySource, right: RegistrySource) =>
    (books.get(left.bookId)?.order ?? 0) -
      (books.get(right.bookId)?.order ?? 0) ||
    (left.paragraph ?? '').localeCompare(right.paragraph ?? '');
  const compareFacts = (left: RegistryFact, right: RegistryFact) =>
    compareSources(sourceFor(left.source), sourceFor(right.source));

  function toggleFavorite(shipId: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(shipId)) next.delete(shipId);
      else next.add(shipId);
      return next;
    });
  }

  function Evidence({ fact }: { fact: RegistryFact }) {
    const primary = sourceFor(fact.source);
    const sources = [
      primary,
      ...(fact.corroboratingSources ?? []).map(sourceFor),
    ].filter(Boolean);

    return (
      <details className="registry-evidence">
        <summary>
          Read source · {bookTitle(primary.bookId)} ·{' '}
          {primary.chapter.replace('Chapter ', 'Ch. ')}
        </summary>
        {sources.map((source, index) => (
          <div className="registry-source" key={`${source.location}-${index}`}>
            <blockquote>{source.evidence}</blockquote>
            <p>
              {bookLabel(source.bookId)} · {source.chapter} · {source.location}
            </p>
          </div>
        ))}
        {fact.notes ? <p>{fact.notes}</p> : null}
        {fact.effectiveThroughLocation ? (
          <p>
            Recorded through {fact.effectiveThroughLocation} in{' '}
            {bookTitle(primary.bookId)}
          </p>
        ) : null}
      </details>
    );
  }

  function Fact({ fact }: { fact: RegistryFact }) {
    const source = sourceFor(fact.source);
    return (
      <div className="registry-fact">
        <div className="registry-fact-label">
          <span>{label(fact.category)}</span>
          {fact.confidence && fact.confidence !== 'explicit' ? (
            <span className="registry-inferred">{label(fact.confidence)}</span>
          ) : null}
        </div>
        <p className="registry-subtle">{bookLabel(source.bookId)}</p>
        <div className="registry-fact-value">
          <RegistryValue value={fact.value} />
          {fact.unit ? (
            <span className="registry-subtle"> ({fact.unit})</span>
          ) : null}
        </div>
        <Evidence fact={fact} />
      </div>
    );
  }

  function latestFact(ship: RegistryShip, categories: string[]) {
    return ship.facts
      .filter((fact) => categories.includes(fact.category))
      .sort((left, right) => compareFacts(right, left))[0];
  }

  function Overview({ ship }: { ship: RegistryShip }) {
    const mentions = registry.mentions.filter(
      (mention) => mention.shipId === ship.id,
    );
    const exactNames = mentions.filter(
      (mention) => mention.mentionType === 'exact_name',
    ).length;
    const outcomes = ship.facts
      .filter((fact) => outcomePattern.test(fact.category))
      .sort((left, right) => compareFacts(right, left));
    const latestOutcomeBook = outcomes[0]
      ? sourceFor(outcomes[0].source).bookId
      : null;

    return (
      <>
        <p className="registry-subtle registry-recorded-in">
          Recorded in {ship.sourceBookIds.map(bookTitle).join(' · ')}
        </p>

        {ship.labelProvenance ? (
          <details className="registry-section">
            <summary>Assigned descriptive label · not a canonical name</summary>
            <p>{ship.labelProvenance.rationale}</p>
            <Evidence
              fact={{
                category: 'label_provenance',
                value: ship.labelProvenance.rationale,
                confidence: 'explicit',
                source: ship.labelProvenance.source,
              }}
            />
          </details>
        ) : null}

        <dl className="registry-essentials">
          {essentialCategories.map((categories) => {
            const fact = latestFact(ship, categories);
            if (!fact) return null;
            const source = sourceFor(fact.source);
            return (
              <div className="registry-essential" key={categories[0]}>
                <dt>
                  {label(fact.category)} · {bookTitle(source.bookId)}
                </dt>
                <dd>
                  <RegistryValue value={fact.value} />
                  {fact.unit ? (
                    <span className="registry-subtle"> ({fact.unit})</span>
                  ) : null}
                  {fact.confidence && fact.confidence !== 'explicit' ? (
                    <span className="registry-inferred">
                      {label(fact.confidence)}
                    </span>
                  ) : null}
                  <Evidence fact={fact} />
                </dd>
              </div>
            );
          })}
        </dl>

        {ship.aliases.length ? (
          <p>
            <span className="registry-subtle">Also known as</span>{' '}
            {ship.aliases.join(', ')}
          </p>
        ) : null}

        {latestOutcomeBook ? (
          <details className="registry-section" open>
            <summary>Recorded outcome · {bookTitle(latestOutcomeBook)}</summary>
            {outcomes
              .filter(
                (fact) => sourceFor(fact.source).bookId === latestOutcomeBook,
              )
              .map((fact, index) => (
                <Fact
                  fact={fact}
                  key={`${fact.category}-${fact.source}-${index}`}
                />
              ))}
          </details>
        ) : null}

        <p className="registry-subtle registry-tally">
          {ship.facts.length} recorded facts · {exactNames} exact-name mentions
          · {mentions.length - exactNames} descriptive references
        </p>
      </>
    );
  }

  function Specifications({ ship }: { ship: RegistryShip }) {
    return (
      <>
        {[
          'Design & capabilities',
          'People & affiliation',
          'Weapons & defenses',
          'Systems & equipment',
        ].map((group) => {
          const facts = ship.facts.filter((fact) => factGroup(fact) === group);
          if (!facts.length) return null;
          return (
            <details className="registry-section" key={group}>
              <summary>
                {group} · {facts.length}
              </summary>
              {facts.map((fact, index) => (
                <Fact
                  fact={fact}
                  key={`${fact.category}-${fact.source}-${index}`}
                />
              ))}
            </details>
          );
        })}
      </>
    );
  }

  function History({ ship }: { ship: RegistryShip }) {
    const facts = ship.facts
      .filter((fact) => factGroup(fact) === 'History')
      .sort(compareFacts);

    if (!facts.length) {
      return (
        <p className="registry-empty">
          No ownership changes, modifications, or damage history are recorded
          for this ship yet.
        </p>
      );
    }

    const groups = new Map<string, RegistryFact[]>();
    facts.forEach((fact) => {
      const source = sourceFor(fact.source);
      const key = `${source.bookId}|${source.chapter}`;
      groups.set(key, [...(groups.get(key) ?? []), fact]);
    });

    return (
      <>
        {[...groups.values()].map((group) => {
          const source = sourceFor(group[0].source);
          return (
            <details
              className="registry-section"
              key={`${source.bookId}-${source.chapter}`}
            >
              <summary>
                {bookLabel(source.bookId)} · {source.chapter} · {group.length}{' '}
                facts
              </summary>
              {group.map((fact, index) => (
                <Fact
                  fact={fact}
                  key={`${fact.category}-${fact.source}-${index}`}
                />
              ))}
            </details>
          );
        })}
      </>
    );
  }

  function Sources({ ship }: { ship: RegistryShip }) {
    const mentions = registry.mentions
      .filter((mention) => mention.shipId === ship.id)
      .sort((left, right) =>
        compareSources(sourceFor(left.source), sourceFor(right.source)),
      );
    const exactNames = mentions.filter(
      (mention) => mention.mentionType === 'exact_name',
    ).length;
    const groups = new Map<string, RegistryMention[]>();

    mentions.forEach((mention) => {
      const source = sourceFor(mention.source);
      const key = `${source.bookId}|${source.chapter}`;
      groups.set(key, [...(groups.get(key) ?? []), mention]);
    });

    return (
      <>
        <p className="registry-subtle registry-recorded-in">
          {exactNames} exact-name mentions · {mentions.length - exactNames}{' '}
          descriptive references · {groups.size} chapter entries
        </p>
        {[...groups.values()].map((group) => {
          const firstSource = sourceFor(group[0].source);
          return (
            <details
              className="registry-section"
              key={`${firstSource.bookId}-${firstSource.chapter}`}
            >
              <summary>
                {bookLabel(firstSource.bookId)} · {firstSource.chapter} ·{' '}
                {group.length}
              </summary>
              {group.map((mention) => {
                const source = sourceFor(mention.source);
                return (
                  <div className="registry-fact" key={mention.id}>
                    <p className="registry-subtle">
                      {source.location} ·{' '}
                      {mention.mentionType === 'descriptive_reference'
                        ? 'Descriptive reference'
                        : 'Exact-name mention'}
                    </p>
                    <blockquote>{source.evidence}</blockquote>
                    {mention.attributionNote ? (
                      <p className="registry-subtle">
                        {mention.attributionNote}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </details>
          );
        })}
      </>
    );
  }

  const totalFacts = data.ships.reduce(
    (count, ship) => count + ship.facts.length,
    0,
  );

  return (
    <section className="ship-registry" aria-labelledby="ship-registry-title">
      <header className="registry-intro">
        <p className="registry-kicker">Vessels of the deep dark</p>
        <h1 id="ship-registry-title">Every ship has a story.</h1>
        <p className="registry-subtle">
          Explore the fleet, one ship at a time.
        </p>
      </header>

      <div className="registry-workspace">
        <aside className="registry-directory" aria-label="Ship directory">
          <div className="registry-filter" aria-label="Ship list filter">
            <button
              aria-pressed={filter === 'favorites'}
              onClick={() => setFilter('favorites')}
              type="button"
            >
              Favorites <span>{favorites.size}</span>
            </button>
            <button
              aria-pressed={filter === 'all'}
              onClick={() => setFilter('all')}
              type="button"
            >
              All ships <span>{data.ships.length}</span>
            </button>
          </div>

          <div className="registry-list-meta">
            <span className="registry-subtle">
              {filter === 'favorites' ? 'Selected favorites' : 'Full directory'}
            </span>
            <button
              aria-controls="registry-favorites-editor"
              aria-expanded={editingFavorites}
              className="registry-text-button"
              onClick={() => setEditingFavorites((current) => !current)}
              type="button"
            >
              Edit favorites
            </button>
          </div>

          {editingFavorites ? (
            <div
              className="registry-favorites-editor"
              id="registry-favorites-editor"
            >
              <h3>Choose your favorites</h3>
              {data.ships.map((ship) => (
                <label key={ship.id}>
                  <input
                    checked={favorites.has(ship.id)}
                    onChange={() => toggleFavorite(ship.id)}
                    type="checkbox"
                  />
                  <span>{ship.name}</span>
                </label>
              ))}
              <button
                className="registry-primary-button"
                onClick={() => setEditingFavorites(false)}
                type="button"
              >
                Done
              </button>
            </div>
          ) : null}

          <div className="registry-ship-list">
            {visibleShips.length ? (
              visibleShips.map((ship) => (
                <button
                  aria-pressed={selectedId === ship.id}
                  className="registry-ship-button"
                  key={ship.id}
                  onClick={() => {
                    setSelectedId(ship.id);
                    setSection('Overview');
                  }}
                  type="button"
                >
                  <span className="registry-ship-copy">
                    <span className="registry-ship-name">{ship.name}</span>
                    <span className="registry-subtle">
                      {vesselTypes[ship.id] ?? 'Vessel'}
                      {ship.nameStatus === 'assigned_descriptive'
                        ? ' · Assigned label'
                        : ''}
                    </span>
                  </span>
                  <span className="registry-row-arrow" aria-hidden="true">
                    ›
                  </span>
                </button>
              ))
            ) : (
              <p className="registry-empty">No favorites selected.</p>
            )}
          </div>
        </aside>

        <article className="registry-detail" aria-label="Selected ship">
          {selectedShip ? (
            <>
              <div className="registry-detail-heading">
                <div>
                  <p className="registry-kicker">
                    {selectedShip.nameStatus === 'assigned_descriptive'
                      ? 'Assigned label · unnamed vessel'
                      : 'Canonical ship name'}
                  </p>
                  <h2>{selectedShip.name}</h2>
                  <p className="registry-subtle">
                    {vesselTypes[selectedShip.id] ?? 'Vessel'}
                  </p>
                </div>
                <button
                  aria-label={`${favorites.has(selectedShip.id) ? 'Remove' : 'Add'} ${selectedShip.name} ${favorites.has(selectedShip.id) ? 'from' : 'to'} favorites`}
                  aria-pressed={favorites.has(selectedShip.id)}
                  className="registry-favorite-button"
                  onClick={() => toggleFavorite(selectedShip.id)}
                  type="button"
                >
                  <span aria-hidden="true">
                    {favorites.has(selectedShip.id) ? '★' : '☆'}
                  </span>{' '}
                  {favorites.has(selectedShip.id) ? 'Favorite' : 'Add favorite'}
                </button>
              </div>

              <div className="registry-tabs" aria-label="Ship detail sections">
                {sections.map((item) => (
                  <button
                    aria-pressed={section === item}
                    key={item}
                    onClick={() => setSection(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="registry-content">
                {section === 'Overview' ? (
                  <Overview ship={selectedShip} />
                ) : null}
                {section === 'Specifications' ? (
                  <Specifications ship={selectedShip} />
                ) : null}
                {section === 'History' ? <History ship={selectedShip} /> : null}
                {section === 'Sources' ? <Sources ship={selectedShip} /> : null}
              </div>
            </>
          ) : (
            <div className="registry-empty-state">
              <h2>Your next favorite awaits.</h2>
              <p className="registry-empty">
                Open All ships or Edit favorites to build your shortlist.
              </p>
            </div>
          )}
        </article>
      </div>

      <footer className="registry-footer">
        <span>Books 01–03 · Through Parley · Spoilers included</span>
        <span aria-live="polite">
          {favorites.size} favorites · {data.ships.length} ships · {totalFacts}{' '}
          facts · {data.books.length} books
        </span>
        <span>{data.scopeNote}</span>
      </footer>
    </section>
  );
}
