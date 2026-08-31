'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Package, Store, LogOut, Heart as HeartIcon } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) {
        setAuthenticated(true);
        setName((u.user_metadata?.name as string) ?? u.email ?? null);
      }
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  const links = [
    { href: '/account/orders', label: 'My Orders', desc: 'Track and review your orders', icon: Package },
    { href: '/account/wishlist', label: 'Wishlist', desc: 'Jerseys you saved for later', icon: HeartIcon },
    { href: '/vendor/apply', label: 'Sell on Jersey Store', desc: 'Become a vendor', icon: Store },
  ];

  return (
    <>
      <Navbar />
      <main className="container py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="mt-1 text-muted-foreground">
              {authenticated && name
                ? `Welcome back, ${name}`
                : 'Manage your profile, orders and preferences.'}
            </p>
          </div>
          {authenticated ? (
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/auth/signin">
                <User className="mr-2 h-4 w-4" /> Sign in
              </Link>
            </Button>
          )}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="group">
              <Card className="h-full transition-all group-hover:border-primary/60 group-hover:shadow-md">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <link.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-3">{link.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{link.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
