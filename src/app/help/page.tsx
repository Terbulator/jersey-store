import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const topics = [
  { title: 'Shipping & Delivery', desc: 'Free shipping over ₹1000, delivery in 2–5 days.', href: '/shipping' },
  { title: 'Returns & Refunds', desc: 'Easy 7-day returns and exchanges.', href: '/returns' },
  { title: 'Size Guide', desc: 'Find your perfect fit before you order.', href: '/shipping' },
  { title: 'Order Tracking', desc: 'Track the status of your order.', href: '/account/orders' },
  { title: 'Payment & Security', desc: 'Payments are securely processed by Stripe.', href: '/shipping' },
  { title: 'Contact Support', desc: 'We reply within 24 hours.', href: '/contact' },
];

export default function HelpPage() {
  return (
    <>
      <Navbar />
      <main className="container py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="mt-2 text-muted-foreground">
            Find answers to common questions about ordering, shipping and returns.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {topics.map((topic) => (
              <Link key={topic.title} href={topic.href} className="group">
                <Card className="h-full transition-all group-hover:border-primary/60 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold">{topic.title}</h2>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{topic.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
