import type { Metadata } from 'next';

import { ShipRegistry } from '@/components/ship-registry';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getPrivateerHomeData } from '@/lib/appwrite';

export const metadata: Metadata = {
  title: 'Ship Registry | Privateer Tales',
  description:
    'Explore the ships of Privateer Tales, with specifications, histories, and source passages through Parley.',
};

export default async function ShipsPage() {
  const { series, books } = await getPrivateerHomeData();

  return (
    <main>
      <SiteHeader series={series} firstBookSlug={books[0]?.slug} />
      <div className="ship-registry-page">
        <ShipRegistry />
      </div>
      <SiteFooter series={series} />
    </main>
  );
}
