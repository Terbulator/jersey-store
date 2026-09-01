'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { StripePaymentElementOptions } from '@stripe/stripe-js';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/store/cart';
import { formatPrice, cn } from '@/lib/utils';
import { Lock, CreditCard, ChevronRight, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { getStripe } from '@/lib/stripe';

const STEPS = ['Shipping', 'Payment', 'Review'] as const;
type Step = (typeof STEPS)[number];

const stripePromise = getStripe();

function PaymentForm({
  clientSecret,
  onSubmit,
  submitting,
}: {
  clientSecret: string;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const elementOptions: StripePaymentElementOptions = {
    layout: { type: 'tabs', defaultCollapsed: false },
  };

  const handlePay = async () => {
    if (!stripe || !elements) return;
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin },
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message ?? 'Payment failed');
    } else {
      onSubmit();
    }
  };

  return (
    <>
      <PaymentElement options={elementOptions} />
      <Button
        type="button"
        size="lg"
        variant="glow"
        className="w-full mt-4"
        disabled={!stripe || submitting}
        onClick={handlePay}
      >
        {submitting ? 'Processing…' : 'Pay Now'}
      </Button>
    </>
  );
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, referralCode } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<Step>('Shipping');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeReady, setStripeReady] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    phone: '',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const shipping = totalPrice() > 1000 ? 0 : 99;
  const tax = totalPrice() * 0.05;
  const total = totalPrice() + shipping + tax;

  const placeOrder = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          fullName: form.fullName,
          phone: form.phone,
          line1: form.line1,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
          items,
          subtotal: totalPrice(),
          couponCode: couponCode || undefined,
          referralCode: referralCode || undefined,
          shipping,
          tax,
          total,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }
      const orderNumber = data.orderNumber ?? '';
      clearCart();
      router.push(`/checkout/success?orderNumber=${encodeURIComponent(orderNumber)}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
      setSubmitting(false);
    }
  };

  const applyCouponCode = async () => {
    if (!couponCode.trim()) return;
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponCode, subtotal: totalPrice() }),
    });
    const d = await res.json();
    if (d.valid) {
      setCouponDiscount(d.discount);
      toast.success(`Coupon ${d.code} applied (−${formatPrice(d.discount)})`);
    } else {
      setCouponDiscount(0);
      toast.error('Invalid or expired coupon');
    }
  };

  const handleContinue = async () => {
    // Validate shipping fields
    if (!form.email || !form.fullName || !form.phone || !form.line1 || !form.city || !form.postalCode) {
      toast.error('Please fill in all shipping fields');
      return;
    }
    if (step === 'Shipping') {
      // Try to create a real Stripe PaymentIntent if configured
      if (stripeReady === null) {
        const s = getStripe();
        setStripeReady(!!s);
      }
      if (stripeReady !== false) {
        try {
          const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: Math.round(total * 100), items }),
          });
          const data = await res.json();
          if (!res.ok) {
            setStripeReady(false);
          } else {
            setClientSecret(data.clientSecret);
          }
        } catch {
          setStripeReady(false);
        }
      }
      setStep('Payment');
    } else if (step === 'Payment') {
      setStep('Review');
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'Shipping') handleContinue();
    else if (step === 'Payment') setStep('Review');
    else placeOrder();
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

  const payWithStripe = step === 'Payment' && (stripeReady === true) && clientSecret;

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

        <form onSubmit={handleFinalSubmit} className="grid gap-8 lg:grid-cols-[1fr_400px]">
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
                    {stripeReady === true && clientSecret ? (
                      <>
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                          <PaymentForm
                            clientSecret={clientSecret}
                            onSubmit={placeOrder}
                            submitting={submitting}
                          />
                        </Elements>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Secured by Stripe
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-3 rounded-lg border border-yellow-300/50 bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-200">
                          <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold">Demo payment mode</p>
                            <p className="mt-1">
                              Stripe is not configured yet, so this checkout places a demo order
                              without charging a card. Add your Stripe keys in <code>.env</code> to
                              go live.
                            </p>
                          </div>
                        </div>
                        <Button type="button" size="lg" variant="glow" className="w-full" onClick={() => setStep('Review')}>
                          Continue to Review
                        </Button>
                      </>
                    )}
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

                {step !== 'Payment' && (
                  <Button type="submit" size="lg" variant="glow" className="w-full" disabled={submitting}>
                    {step === 'Review' ? `Place Order · ${formatPrice(total)}` : 'Continue'}
                  </Button>
                )}
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
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600"><span>Coupon</span><span>−{formatPrice(couponDiscount)}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total - couponDiscount)}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponDiscount(0); }}
                      className="h-9"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={applyCouponCode}>Apply</Button>
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
