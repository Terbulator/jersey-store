'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, Lock } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { trackEvent } from '@/lib/analytics';

type Step = 1 | 2 | 3;

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const { items, subtotal, clearCart } = useCartStore();
  const shipping = subtotal() > 999 ? 0 : 99;
  const total = subtotal() + shipping;

  useEffect(() => {
    trackEvent('begin_checkout', { page_url: window.location.href });
  }, []);

  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const steps = [
    { num: 1, label: 'Contact' },
    { num: 2, label: 'Delivery' },
    { num: 3, label: 'Payment' },
  ];

  if (items.length === 0) {
    return (
      <section className="py-24 px-4 text-center">
        <h2 className="text-xl font-bold text-charcoal mb-2">Your cart is empty</h2>
        <p className="text-sm text-chrome mb-6">Add some items before checking out.</p>
        <Link href="/shop" className="inline-block px-8 py-3 bg-blood-red text-off-white text-[11px] tracking-widest uppercase hover:bg-charcoal transition-colors">
          Shop Now
        </Link>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal uppercase">Checkout</h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <button
                onClick={() => s.num < step && setStep(s.num as Step)}
                className={cn(
                  'w-7 h-7 flex items-center justify-center text-[11px] font-bold transition-colors',
                  step > s.num
                    ? 'bg-blood-red text-off-white'
                    : step === s.num
                    ? 'bg-charcoal text-off-white'
                    : 'bg-charcoal/10 text-chrome'
                )}
              >
                {step > s.num ? <Check className="w-3 h-3" /> : s.num}
              </button>
              <span className={cn(
                'text-[11px] tracking-wider uppercase hidden sm:inline',
                step >= s.num ? 'text-charcoal' : 'text-chrome'
              )}>
                {s.label}
              </span>
              {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-chrome/40 mx-1" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold tracking-widest uppercase mb-4">Contact</h2>
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-charcoal/15 text-sm text-charcoal outline-none focus:border-blood-red transition-colors"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First name"
                    value={form.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    className="px-4 py-3 bg-white border border-charcoal/15 text-sm text-charcoal outline-none focus:border-blood-red transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={form.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                    className="px-4 py-3 bg-white border border-charcoal/15 text-sm text-charcoal outline-none focus:border-blood-red transition-colors"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-charcoal/15 text-sm text-charcoal outline-none focus:border-blood-red transition-colors"
                />
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 bg-blood-red text-off-white text-[11px] tracking-widest uppercase hover:bg-charcoal transition-colors mt-4"
                >
                  Continue to Delivery
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold tracking-widest uppercase mb-4">Delivery Address</h2>
                <input
                  type="text"
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-charcoal/15 text-sm text-charcoal outline-none focus:border-blood-red transition-colors"
                />
                <input
                  type="text"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={form.apartment}
                  onChange={(e) => update('apartment', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-charcoal/15 text-sm text-charcoal outline-none focus:border-blood-red transition-colors"
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    className="px-4 py-3 bg-white border border-charcoal/15 text-sm text-charcoal outline-none focus:border-blood-red transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    className="px-4 py-3 bg-white border border-charcoal/15 text-sm text-charcoal outline-none focus:border-blood-red transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="PIN code"
                    value={form.pincode}
                    onChange={(e) => update('pincode', e.target.value)}
                    className="px-4 py-3 bg-white border border-charcoal/15 text-sm text-charcoal outline-none focus:border-blood-red transition-colors"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3.5 border border-charcoal/20 text-[11px] tracking-widest uppercase text-charcoal hover:bg-off-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3.5 bg-blood-red text-off-white text-[11px] tracking-widest uppercase hover:bg-charcoal transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold tracking-widest uppercase mb-4">Payment</h2>
                <div className="bg-white border border-charcoal/15 p-4">
                  <p className="text-xs text-chrome mb-2">Payment method</p>
                  <div className="border border-charcoal/15 p-3 text-sm text-charcoal">
                    Cash on Delivery (COD)
                  </div>
                  <p className="text-[10px] text-chrome/60 mt-2">Pay when your order is delivered.</p>
                </div>
                <div className="bg-white border border-charcoal/15 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-3 h-3 text-green-600" />
                    <p className="text-xs text-charcoal font-medium">Secure Checkout</p>
                  </div>
                  <p className="text-[10px] text-chrome">Your payment information is encrypted and secure.</p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3.5 border border-charcoal/20 text-[11px] tracking-widest uppercase text-charcoal hover:bg-off-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={async () => {
                      setPlacing(true);
                      setError('');
                      try {
                        const res = await fetch('/api/orders', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            items: items.map((i) => ({ productId: i.product.id, size: i.size, quantity: i.quantity })),
                            customerName: `${form.firstName} ${form.lastName}`.trim(),
                            email: form.email,
                            phone: form.phone,
                            address: {
                              line1: form.address,
                              line2: form.apartment,
                              city: form.city,
                              state: form.state,
                              pincode: form.pincode,
                            },
                            paymentMethod: 'COD',
                          }),
                        });
                        const data = await res.json();
                        if (!res.ok) {
                          throw new Error(data.error || 'Could not place your order.');
                        }
                        clearCart();
                        window.location.href = `/checkout/success?order=${data.order.order_number}`;
                      } catch (e) {
                        setPlacing(false);
                        setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
                      }
                    }}
                    disabled={placing || !form.email || !form.firstName || !form.lastName || !form.address || !form.city || !form.state || !form.pincode}
                    className="flex-1 py-3.5 bg-blood-red text-off-white text-[11px] tracking-widest uppercase hover:bg-charcoal transition-colors disabled:opacity-50"
                  >
                    {placing ? 'Placing order…' : `Place Order · ${formatPrice(total)}`}
                  </button>
                </div>
                {error && <p className="text-[12px] text-blood-red mt-2">{error}</p>}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-charcoal/5 p-5 lg:sticky lg:top-24">
              <h2 className="text-[11px] tracking-widest uppercase font-medium text-charcoal mb-4">Order Summary</h2>

              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                    <div className="w-14 h-16 bg-off-white flex-shrink-0 overflow-hidden relative">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-charcoal/70 text-off-white text-[9px] flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-charcoal truncate">{item.product.name}</p>
                      <p className="text-[10px] text-chrome">Size: {item.size}</p>
                    </div>
                    <p className="text-xs font-medium text-charcoal">{formatPrice(item.product.basePrice * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-charcoal/10 pt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-chrome">Subtotal</span>
                  <span>{formatPrice(subtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-chrome">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-charcoal/10">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
