const APPWRITE_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '6a0b4638002a71c2b8ec';
const APPWRITE_DATABASE_ID = '6a0b628900008b8506e3';
const PRIVATEER_SERIES_ID = '6aa15976002477bbb01e';

export type SeriesRecord = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  card_tag?: string;
  card_meta?: string;
};

export type BookRecord = {
  id: string;
  series_number: number;
  title: string;
  slug: string;
  tagline: string;
  blurb: string;
  card_description: string;
  cover_url: string;
  cover_thumb_url: string;
  cover_alt: string;
  store_label: string;
  store_url: string;
  audible_url: string;
  release_date: string;
};

type AppwriteDocument = Record<string, unknown> & { $id: string };

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function getAppwriteApiKey() {
  return process.env.PRIVATEER_CATALOG_API_KEY ?? process.env.APPWRITE_API_KEY;
}

async function appwriteHeaders() {
  const headers: Record<string, string> = {
    'X-Appwrite-Project': APPWRITE_PROJECT_ID,
  };

  const apiKey = getAppwriteApiKey();
  if (typeof apiKey === 'string' && apiKey) {
    headers['X-Appwrite-Key'] = apiKey;
  }

  return headers;
}

async function appwriteFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${APPWRITE_ENDPOINT}${path}`, {
    headers: await appwriteHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Appwrite request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function asSeries(document: AppwriteDocument): SeriesRecord {
  return {
    id: document.$id,
    name: stringValue(document.name),
    slug: stringValue(document.slug),
    tagline: stringValue(document.tagline),
    description: stringValue(document.description),
    card_tag: stringValue(document.card_tag),
    card_meta: stringValue(document.card_meta),
  };
}

function asBook(document: AppwriteDocument): BookRecord {
  return {
    id: document.$id,
    series_number: Number(document.series_number ?? 0),
    title: stringValue(document.title),
    slug: stringValue(document.slug),
    tagline: stringValue(document.tagline),
    blurb: stringValue(document.blurb),
    card_description: stringValue(document.card_description),
    cover_url: stringValue(document.cover_url),
    cover_thumb_url: stringValue(document.cover_thumb_url),
    cover_alt: stringValue(
      document.cover_alt,
      `${stringValue(document.title, 'Book')} cover`,
    ),
    store_label: stringValue(document.store_label, 'Buy the book'),
    store_url: stringValue(document.store_url),
    audible_url: stringValue(document.audible_url),
    release_date: stringValue(document.release_date),
  };
}

function bookQueries() {
  const queries = new URLSearchParams();
  queries.append(
    'queries[]',
    JSON.stringify({
      method: 'equal',
      attribute: 'series_id',
      values: [PRIVATEER_SERIES_ID],
    }),
  );
  queries.append(
    'queries[]',
    JSON.stringify({
      method: 'equal',
      attribute: 'status',
      values: ['published'],
    }),
  );
  queries.append(
    'queries[]',
    JSON.stringify({ method: 'orderAsc', attribute: 'series_number' }),
  );
  queries.append(
    'queries[]',
    JSON.stringify({ method: 'limit', values: [100] }),
  );
  return queries;
}

export async function getPrivateerHomeData(): Promise<{
  series: SeriesRecord;
  books: BookRecord[];
}> {
  if (!getAppwriteApiKey()) {
    throw new Error(
      'APPWRITE_API_KEY is required to load the Privateer Tales catalog.',
    );
  }

  const [seriesDocument, bookList] = await Promise.all([
    appwriteFetch<AppwriteDocument>(
      `/databases/${APPWRITE_DATABASE_ID}/collections/series/documents/${PRIVATEER_SERIES_ID}`,
    ),
    appwriteFetch<{ documents: AppwriteDocument[] }>(
      `/databases/${APPWRITE_DATABASE_ID}/collections/books/documents?${bookQueries().toString()}`,
    ),
  ]);

  return {
    series: asSeries(seriesDocument),
    books: bookList.documents.map(asBook),
  };
}

export async function getPrivateerBookBySlug(slug: string) {
  const data = await getPrivateerHomeData();
  return {
    ...data,
    book: data.books.find((candidate) => candidate.slug === slug) ?? null,
  };
}
