'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get('orderNumber') ?? '';

  return (
    <main className="container flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pitch-100 text-pitch-700 dark:bg-pitch-900/40 dark:text-pitch-500">
        <CheckCircle2 className="h-12 w-12" />
      </div>
      <h1 className="mt-6 text-3xl font-bold">Order placed!</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Thank you for your purchase. We&apos;ve received your order and will email you a
        confirmation shortly.
      </p>
      {orderNumber && (
        <div className="mt-6 flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            Order number: <strong>{orderNumber}</strong>
          </span>
        </div>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" variant="glow">
          <Link href="/products">Continue shopping</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/account/orders">View my orders</Link>
        </Button>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense>
        <SuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}
