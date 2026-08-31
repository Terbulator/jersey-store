'use client';

import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ArrowLeft } from 'lucide-react';

export default function OrdersPage() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="container py-10">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link href="/account">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to account
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-6">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No orders yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              When you complete a purchase, your order history will appear here.
            </p>
            <Button asChild className="mt-6" variant="glow">
              <Link href="/products">Start shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
