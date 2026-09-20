'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Package, MapPin, Heart, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Profile', href: '/account', icon: User },
  { label: 'Orders', href: '/account/orders', icon: Package },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
];

export default function AccountPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal uppercase">Account</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <nav className="space-y-0">
              {NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 py-3.5 px-4 text-[11px] tracking-widest uppercase border-b border-charcoal/10 transition-colors',
                      item.href === '/account'
                        ? 'text-blood-red font-medium'
                        : 'text-charcoal hover:text-blood-red'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <button className="flex items-center gap-3 py-3.5 px-4 text-[11px] tracking-widest uppercase text-blood-red hover:opacity-70 transition-opacity border-b border-charcoal/10 w-full text-left">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white border border-charcoal/5 p-6">
              <h2 className="text-sm font-bold tracking-widest uppercase mb-6">Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] tracking-widest uppercase text-chrome block mb-1.5">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-charcoal/15 text-sm text-charcoal outline-none focus:border-blood-red transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] tracking-widest uppercase text-chrome block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-charcoal/15 text-sm text-charcoal outline-none focus:border-blood-red transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] tracking-widest uppercase text-chrome block mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-charcoal/15 text-sm text-charcoal outline-none focus:border-blood-red transition-colors"
                  />
                </div>
              </div>
              <button className="mt-6 px-8 py-3.5 bg-blood-red text-off-white text-[11px] tracking-widest uppercase hover:bg-charcoal transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
