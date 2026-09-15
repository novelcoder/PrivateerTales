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

type AppwriteRow = Record<string, unknown> & { $id: string };

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function getAppwriteApiKey() {
  return process.env.PRIVATEER_CATALOG_API_KEY;
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
    const error = (await response.json().catch(() => null)) as {
      message?: unknown;
      type?: unknown;
    } | null;
    const errorType = typeof error?.type === 'string' ? error.type : '';
    const errorMessage =
      typeof error?.message === 'string' ? error.message : response.statusText;
    const details = [errorType, errorMessage].filter(Boolean).join(': ');

    throw new Error(
      `Appwrite request failed with status ${response.status}${details ? `: ${details}` : ''}`,
    );
  }

  return response.json() as Promise<T>;
}

function asSeries(row: AppwriteRow): SeriesRecord {
  return {
    id: row.$id,
    name: stringValue(row.name),
    slug: stringValue(row.slug),
    tagline: stringValue(row.tagline),
    description: stringValue(row.description),
    card_tag: stringValue(row.card_tag),
    card_meta: stringValue(row.card_meta),
  };
}

function asBook(row: AppwriteRow): BookRecord {
  return {
    id: row.$id,
    series_number: Number(row.series_number ?? 0),
    title: stringValue(row.title),
    slug: stringValue(row.slug),
    tagline: stringValue(row.tagline),
    blurb: stringValue(row.blurb),
    card_description: stringValue(row.card_description),
    cover_url: stringValue(row.cover_url),
    cover_thumb_url: stringValue(row.cover_thumb_url),
    cover_alt: stringValue(
      row.cover_alt,
      `${stringValue(row.title, 'Book')} cover`,
    ),
    store_label: stringValue(row.store_label, 'Buy the book'),
    store_url: stringValue(row.store_url),
    audible_url: stringValue(row.audible_url),
    release_date: stringValue(row.release_date),
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
      'PRIVATEER_CATALOG_API_KEY is required to load the Privateer Tales catalog.',
    );
  }

  const [seriesRow, bookList] = await Promise.all([
    appwriteFetch<AppwriteRow>(
      `/tablesdb/${APPWRITE_DATABASE_ID}/tables/series/rows/${PRIVATEER_SERIES_ID}`,
    ),
    appwriteFetch<{ rows: AppwriteRow[] }>(
      `/tablesdb/${APPWRITE_DATABASE_ID}/tables/books/rows?${bookQueries().toString()}`,
    ),
  ]);

  return {
    series: asSeries(seriesRow),
    books: bookList.rows.map(asBook),
  };
}

export async function getPrivateerBookBySlug(slug: string) {
  const data = await getPrivateerHomeData();
  return {
    ...data,
    book: data.books.find((candidate) => candidate.slug === slug) ?? null,
  };
}
