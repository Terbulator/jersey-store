'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/store/cart';
import { formatPrice, cn } from '@/lib/utils';
import { Lock, CreditCard, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = ['Shipping', 'Payment', 'Review'] as const;
type Step = (typeof STEPS)[number];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<Step>('Shipping');
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    phone: '',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const shipping = totalPrice() > 1000 ? 0 : 99;
  const tax = totalPrice() * 0.05;
  const total = totalPrice() + shipping + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'Shipping') setStep('Payment');
    else if (step === 'Payment') setStep('Review');
    else {
      toast.success('Order placed successfully!', { description: 'You will receive a confirmation email shortly.' });
      clearCart();
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Button asChild>
            <Link href="/products">Continue shopping</Link>
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {/* Stepper */}
        <div className="mb-8 flex items-center justify-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  step === s || STEPS.indexOf(step) > i
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {i + 1}
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">{s}</span>
              {i < STEPS.length - 1 && <ChevronRight className="mx-4 h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                {step === 'Shipping' && (
                  <>
                    <h2 className="text-xl font-semibold">Shipping Information</h2>
                    <Input placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Full name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                      <Input placeholder="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <Input placeholder="Address line 1" required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
                    <div className="grid grid-cols-3 gap-3">
                      <Input placeholder="City" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                      <Input placeholder="State" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                      <Input placeholder="PIN code" required value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
                    </div>
                  </>
                )}

                {step === 'Payment' && (
                  <>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <CreditCard className="h-5 w-5" /> Payment Details
                    </h2>
                    <Input placeholder="Card number" required maxLength={19} value={form.cardNumber} onChange={(e) => setForm({ ...form, cardNumber: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="MM/YY" required value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
                      <Input placeholder="CVV" required maxLength={4} value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value })} />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Secured by Stripe
                    </p>
                  </>
                )}

                {step === 'Review' && (
                  <>
                    <h2 className="text-xl font-semibold">Review your order</h2>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> {form.email}</p>
                      <p><strong>Ship to:</strong> {form.fullName}, {form.line1}, {form.city}, {form.state} {form.postalCode}</p>
                      <p><strong>Phone:</strong> {form.phone}</p>
                    </div>
                  </>
                )}

                <Button type="submit" size="lg" variant="glow" className="w-full">
                  {step === 'Review' ? `Place Order · ${formatPrice(total)}` : 'Continue'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Order summary */}
          <div>
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold">Order Summary</h2>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-3">
                      <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.size} · {item.color} · ×{item.quantity}</p>
                        <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(totalPrice())}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                  <div className="flex justify-between"><span>Tax (5%)</span><span>{formatPrice(tax)}</span></div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>

      <Footer />
    </>
  );
}
