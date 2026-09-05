'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Users, FolderTree, Building2, ShieldCheck,
  LogOut, Menu, X, Settings, ScrollText, HardHat, ListTodo, BarChart3, TicketPercent, LifeBuoy, Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/owners', label: 'Owners', icon: Building2 },
  { href: '/admin/workers', label: 'Workers', icon: HardHat },
  { href: '/admin/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/admin/tickets', label: 'Tickets', icon: LifeBuoy },
  { href: '/admin/resellers', label: 'Resellers', icon: Store },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/audit', label: 'Audit Log', icon: ScrollText },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminNav({ userName, userEmail }: { userName: string | null; userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href + '/') || pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Admin</span>
        </div>
        <NavLinks />
        <div className="mt-auto border-t border-border/60 pt-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium">{userName ?? 'Admin'}</p>
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

      {/* Top bar (mobile) */}
      <div className="flex w-full flex-col md:hidden">
        <div className="flex h-14 items-center justify-between border-b border-border/60 bg-card px-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-bold">Admin</span>
          </div>
          <button onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="border-b border-border/60 bg-card p-4">
            <NavLinks onClick={() => setOpen(false)} />
          </div>
        )}
      </div>
    </>
  );
}
