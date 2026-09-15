import type { BookRecord } from '@/lib/appwrite';

export type AnalyticsEventParameters = Record<string, unknown>;

export function analyticsClick(
  eventName: string,
  parameters: AnalyticsEventParameters,
) {
  return {
    'data-ga-event': eventName,
    'data-ga-params': JSON.stringify(parameters),
  } as const;
}

export function analyticsView(
  eventName: string,
  parameters: AnalyticsEventParameters,
) {
  return {
    'data-ga-view-event': eventName,
    'data-ga-params': JSON.stringify(parameters),
  } as const;
}

export function bookAnalyticsItem(book: BookRecord, index?: number) {
  return {
    item_id: book.id,
    item_name: book.title,
    item_brand: 'Jamie McFarlane',
    item_category: 'Book',
    item_category2: 'Privateer Tales',
    item_variant: `Book ${book.series_number}`,
    ...(index === undefined ? {} : { index }),
  };
}
