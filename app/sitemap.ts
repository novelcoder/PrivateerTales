import type { MetadataRoute } from 'next';

import { getPrivateerHomeData } from '@/lib/appwrite';

const SITE_URL = 'https://privateertales.com';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { books } = await getPrivateerHomeData();
  const staticPaths = ['/', '/books', '/ships'];

  return [
    ...staticPaths.map((path) => ({
      url: new URL(path, SITE_URL).toString(),
    })),
    ...books.map((book) => ({
      url: new URL(
        `/books/${encodeURIComponent(book.slug)}`,
        SITE_URL,
      ).toString(),
    })),
  ];
}
