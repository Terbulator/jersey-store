import Link from 'next/link';
import { Shirt, Instagram, Twitter, Facebook, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shirt className="h-5 w-5" />
              </div>
              <span className="gradient-text">Jersey Store</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Premium retro and current football jerseys with interactive 3D previews.
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-foreground">All Jerseys</Link></li>
              <li><Link href="/categories/retro" className="hover:text-foreground">Retro</Link></li>
              <li><Link href="/categories/current" className="hover:text-foreground">Current Season</Link></li>
              <li><Link href="/categories/world-cup" className="hover:text-foreground">World Cup</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/account" className="hover:text-foreground">My Account</Link></li>
              <li><Link href="/account/orders" className="hover:text-foreground">Orders</Link></li>
              <li><Link href="/account/wishlist" className="hover:text-foreground">Wishlist</Link></li>
              <li><Link href="/vendor/apply" className="hover:text-foreground">Sell on Jersey Store</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
              <li><Link href="/shipping" className="hover:text-foreground">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-foreground">Returns</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>© 2026 Jersey Store. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
