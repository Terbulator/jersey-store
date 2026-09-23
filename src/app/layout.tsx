import '@/styles/globals.css';
import { Navbar } from '@/components/website/header/navbar';
import { MobileMenu } from '@/components/website/header/mobile-menu';
import { Footer } from '@/components/website/footer/footer';
import { CartDrawer } from '@/components/website/cart/cart-drawer';
import { AnnouncementBar } from '@/components/website/header/announcement-bar';
import { SearchOverlay } from '@/components/website/search/search-overlay';
import { AuthProvider } from '@/components/auth/auth-provider';
import { StorefrontGate } from '@/components/storefront-gate';
import { AnalyticsTracker } from '@/components/analytics-tracker';
import { getNavItems, getProducts, getEditions } from '@/lib/storefront';

export const metadata = {
  title: 'HEADERR — Premium Football & Cricket Jerseys',
  description: 'HEADERR.IN — Premium football + cricket jerseys and streetwear for GEN-Z culture.',
  openGraph: {
    title: 'HEADERR — Premium Sportswear',
    description: 'Premium football + cricket jerseys and streetwear.',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [navItems, products, editions] = await Promise.all([
    getNavItems(),
    getProducts(),
    getEditions(),
  ]);

  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-black text-off-white antialiased">
        <AuthProvider>
          <StorefrontGate>
            <AnnouncementBar />
            <Navbar navItems={navItems} />
            <MobileMenu navItems={navItems} />
            <SearchOverlay products={products} editions={editions} />
            <CartDrawer />
          </StorefrontGate>
          <main>{children}</main>
          <AnalyticsTracker />
        </AuthProvider>
        <StorefrontGate>
          <Footer navItems={navItems} />
        </StorefrontGate>
      </body>
    </html>
  );
}