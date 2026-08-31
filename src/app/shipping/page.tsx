import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck } from 'lucide-react';

const rows = [
  {
    title: 'Standard Delivery',
    desc: '2–5 business days across India.',
    cost: 'FREE on orders over ₹1000, otherwise ₹99',
  },
  {
    title: 'Express Delivery',
    desc: '1–2 business days in metro cities.',
    cost: '₹199 flat',
  },
  {
    title: 'International',
    desc: '7–14 business days worldwide.',
    cost: 'Calculated at checkout',
  },
];

export default function ShippingPage() {
  return (
    <>
      <Navbar />
      <main className="container py-16">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link href="/help">
            <ArrowLeft className="mr-1 h-4 w-4" /> Help Center
          </Link>
        </Button>
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Truck className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold">Shipping & Delivery</h1>
          </div>
          <p className="mt-4 text-muted-foreground">
            We ship all over India and internationally. Orders are processed within 24 hours of
            placing your order.
          </p>
          <div className="mt-8 space-y-3">
            {rows.map((row) => (
              <div key={row.title} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-5">
                <div>
                  <h2 className="font-semibold">{row.title}</h2>
                  <p className="text-sm text-muted-foreground">{row.desc}</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {row.cost}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
