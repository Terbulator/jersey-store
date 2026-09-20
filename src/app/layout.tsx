import '@/styles/globals.css';
import { Navbar } from '@/components/website/header/navbar';
import { Footer } from '@/components/website/footer/footer';
import { CartDrawer } from '@/components/website/cart/cart-drawer';
import { AnnouncementBar } from '@/components/website/header/announcement-bar';

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
      <body className="bg-off-white text-charcoal antialiased">
        <AnnouncementBar />
        <Navbar />
        <CartDrawer />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}