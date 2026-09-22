'use client';

import Link from 'next/link';
import { LogOut, Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { ADMIN_NAV } from '@/lib/admin-nav';
import { useAuth } from '@/components/auth/auth-provider';

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full w-60 flex-col bg-[#0D0D0D]">
      <div className="flex h-14 items-center gap-2.5 border-b border-[#292929] px-5">
        <span className="font-display text-lg leading-none text-[#EFECE6]">HEADERR</span>
        <span className="rounded-sm bg-[#B3001B] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#EFECE6]">
          Admin
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {ADMIN_NAV.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-[#A8A8A8] transition-colors hover:bg-[#171717] hover:text-[#EFECE6]"
                  >
                    <item.icon className="h-3.5 w-3.5 text-[#666666]" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-[#292929] p-3">
        <p className="px-1 text-[11px] text-[#666666]">HEADERR Command Center</p>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { signOut, firstName } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-[#080808] text-[#EFECE6]"
      style={{ fontFamily: "'Suisse Intl', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden md:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Topbar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-[#292929] bg-[#080808]/90 px-4 backdrop-blur-sm md:pl-[252px] md:pr-6">
        <div className="flex items-center gap-3">
          <button
            className="rounded-md border border-[#292929] p-2 text-[#A8A8A8] md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#666666]" />
            <input
              placeholder="Search admin…"
              className="h-8 w-64 rounded-md border border-[#292929] bg-[#0D0D0D] pl-8 pr-3 text-[12px] text-[#EFECE6] placeholder:text-[#666666] focus:border-[#B3001B] focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B3001B] text-[11px] font-bold uppercase text-[#EFECE6]">
            {(firstName ?? 'A').slice(0, 1)}
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 rounded-md border border-[#292929] px-2.5 py-1.5 text-[11px] text-[#A8A8A8] hover:border-[#B3001B] hover:text-[#EFECE6]"
          >
            <LogOut className="h-3 w-3" />
            Sign out
          </button>
        </div>
      </header>

      <main className="min-h-screen pt-14 md:pl-60">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}