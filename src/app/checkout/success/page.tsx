'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Package, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';

export default function CheckoutSuccessPage() {
  const [orderId, setOrderId] = useState('HDR-UNKNOWN');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order = params.get('order');
    if (order) setOrderId(order);
  }, []);

  return (
    <section className="py-16 sm:py-24 px-4 text-center">
      <div className="max-w-md mx-auto">
        {/* Confirmation icon */}
        <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal mb-2">Order Confirmed</h1>
        <p className="text-xs text-chrome tracking-wider uppercase mb-1">Order #{orderId}</p>
        <p className="text-sm text-chrome/70 mb-8">
          Thank you for shopping with HEADERR. We&apos;ll send you a confirmation email shortly.
        </p>

        {/* Order Info */}
        <div className="bg-white border border-charcoal/5 p-5 mb-8 text-left">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-4 h-4 text-blood-red" />
            <div>
              <p className="text-xs font-medium text-charcoal">Estimated Delivery</p>
              <p className="text-[11px] text-chrome">5–7 business days</p>
            </div>
          </div>
          <div className="border-t border-charcoal/5 pt-3">
            <p className="text-[11px] text-chrome">You will receive tracking information via email once your order is shipped.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shop"
            className="px-8 py-3 bg-blood-red text-off-white text-[11px] tracking-widest uppercase hover:bg-charcoal transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account/orders"
            className="px-8 py-3 border border-charcoal/20 text-[11px] tracking-widest uppercase text-charcoal hover:bg-off-white transition-colors inline-flex items-center justify-center gap-2"
          >
            Track Order
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
