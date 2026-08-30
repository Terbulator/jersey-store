import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Jersey Store — Premium Retro & Current Football Kits',
    template: '%s | Jersey Store',
  },
  description:
    'Shop authentic retro and current football jerseys. Interactive 3D previews, free shipping across India, and exclusive collections from top clubs and national teams.',
  keywords: [
    'football jerseys',
    'retro jerseys',
    'soccer kits',
    'messi jersey',
    'ronaldo jersey',
    'india',
  ],
  authors: [{ name: 'Jersey Store' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://jerseystore.com',
    siteName: 'Jersey Store',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
