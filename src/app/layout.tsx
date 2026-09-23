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
import { ThemeProvider, ThemeStyle, TemplatesProvider } from '@/components/website/theme-provider';
import { getTheme } from '@/lib/theme';
import { getDisplay } from '@/lib/display';
import { getSiteChrome } from '@/lib/site-chrome';
import { createClient } from '@/lib/supabase/server';
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
  const [navItems, products, editions, theme, chrome, display] = await Promise.all([
    getNavItems(),
    getProducts(),
    getEditions(),
    getTheme(createClient()),
    getSiteChrome(createClient()),
    getDisplay(createClient()),
  ]);

  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-black text-off-white antialiased">
        <ThemeStyle theme={theme} />
        <ThemeProvider theme={theme}>
        <TemplatesProvider display={display}>
        <AuthProvider>
          <StorefrontGate>
            <AnnouncementBar />
            <Navbar navItems={navItems} header={chrome.header} />
            <MobileMenu navItems={navItems} header={chrome.header} />
            <SearchOverlay products={products} editions={editions} />
            <CartDrawer />
          </StorefrontGate>
          <main>{children}</main>
          <AnalyticsTracker />
        </AuthProvider>
        <StorefrontGate>
          <Footer navItems={navItems} footer={chrome.footer} />
        </StorefrontGate>
        </TemplatesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}