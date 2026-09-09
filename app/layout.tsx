import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Privateer Tales | Jamie McFarlane',
  description:
    'Bold crews, distant worlds, and twenty space-opera adventures by Jamie McFarlane.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
