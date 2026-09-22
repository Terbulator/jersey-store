import '@/styles/globals.css';
import { Navbar } from '@/components/website/header/navbar';
import { MobileMenu } from '@/components/website/header/mobile-menu';
import { Footer } from '@/components/website/footer/footer';
import { CartDrawer } from '@/components/website/cart/cart-drawer';
import { AnnouncementBar } from '@/components/website/header/announcement-bar';
import { SearchOverlay } from '@/components/website/search/search-overlay';
import { AuthProvider } from '@/components/auth/auth-provider';

export const metadata = {
  title: 'HEADERR — Premium Football & Cricket Jerseys',
  description: 'HEADERR.IN — Premium football + cricket jerseys and streetwear for GEN-Z culture.',
  openGraph: {
    title: 'HEADERR — Premium Sportswear',
    description: 'Premium football + cricket jerseys and streetwear.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-black text-off-white antialiased">
        <AuthProvider>
          <AnnouncementBar />
          <Navbar />
          <MobileMenu />
          <SearchOverlay />
          <CartDrawer />
          <main>{children}</main>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}