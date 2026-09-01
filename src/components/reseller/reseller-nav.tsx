'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, LogOut, Menu, X, Share2, Package, ShoppingCart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/reseller', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/reseller/products', label: 'Products', icon: Package },
  { href: '/reseller/orders', label: 'Orders', icon: ShoppingCart },
];

export function ResellerNav({ userName, userEmail }: { userName: string | null; userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <Share2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Reseller</span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href + '/') || pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-border/60 pt-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium">{userName ?? 'Reseller'}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex w-full flex-col md:hidden">
        <div className="flex h-14 items-center justify-between border-b border-border/60 bg-card px-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <span className="font-bold">Reseller</span>
          </div>
          <button onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="border-b border-border/60 bg-card p-4">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
                  <span className="inline-flex items-center gap-3"><item.icon className="h-4 w-4" />{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </>
  );
}
