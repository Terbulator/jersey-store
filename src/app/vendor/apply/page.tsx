'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Store, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorApplyPage() {
  const [form, setForm] = useState({ storeName: '', email: '', description: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success('Application received!', { description: 'Our team will review your store.' });
  };

  if (sent) {
    return (
      <>
        <Navbar />
        <CartDrawer />
        <main className="container flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pitch-100 text-pitch-700 dark:bg-pitch-900/40 dark:text-pitch-500">
            <BadgeCheck className="h-12 w-12" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">Application submitted</h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            Thanks for your interest! We review every vendor application and will reach out to
            {form.email ? ` ${form.email}` : ''} within 2–3 business days.
          </p>
          <Button asChild className="mt-8" variant="glow">
            <Link href="/products">Continue browsing</Link>
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="container flex items-center justify-center py-16">
        <Card className="w-full max-w-xl">
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Store className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold">Sell on Jersey Store</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Reach thousands of football fans with your jersey collection.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input placeholder="Store name" required value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
              <Input type="email" placeholder="Business email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <textarea
                placeholder="Tell us about your jerseys…"
                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <Button type="submit" size="lg" variant="glow" className="w-full">Submit application</Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
