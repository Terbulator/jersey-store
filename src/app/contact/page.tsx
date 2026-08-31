'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success('Message sent!', { description: 'We will reply within 24 hours.' });
  };

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="container py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold">Contact Us</h1>
          <p className="mt-2 text-muted-foreground">
            Have a question about your order, a jersey, or our store? We&apos;d love to hear from you.
          </p>

          <Card className="mt-8">
            <CardContent className="p-6">
              {sent ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="rounded-full bg-pitch-100 p-4 text-pitch-700 dark:bg-pitch-900/40 dark:text-pitch-500">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold">Thanks for reaching out!</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Our support team will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Your name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <Input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <textarea
                    placeholder="How can we help?"
                    required
                    className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                  <Button type="submit" size="lg" variant="glow" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" /> Send message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
