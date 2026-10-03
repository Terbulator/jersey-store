'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Package, ArrowRight, Copy, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const TOKEN_PREFIX = 'headerr:order:';

export default function CheckoutSuccessPage() {
  const [orderId, setOrderId] = useState('HDR-UNKNOWN');
  const [orderTotal, setOrderTotal] = useState<number | null>(null);
  const [token, setToken] = useState('');
  const [lookupFailed, setLookupFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  // The tracking token comes from the checkout response, which puts it in the URL and
  // in sessionStorage. Only the SHA-256 of this value is stored server-side.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order = params.get('order');
    if (!order) return;

    setOrderId(order);

    let tokenFromUrl = params.get('token') ?? '';
    if (!tokenFromUrl) {
      try {
        tokenFromUrl = sessionStorage.getItem(`${TOKEN_PREFIX}${order}`) ?? '';
      } catch {
        tokenFromUrl = '';
      }
    }
    setToken(tokenFromUrl);

    const query = new URLSearchParams({ order });
    if (tokenFromUrl) query.set('token', tokenFromUrl);

    fetch(`/api/orders?${query.toString()}`, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) {
          setLookupFailed(true);
          return;
        }
        const data = await r.json();
        const total = data.order?.total ?? null;
        if (total !== null) {
          setOrderTotal(total);
          trackEvent('purchase', {
            product_name: `Order ${order}`,
            category: 'checkout',
            price: total,
            page_url: window.location.href,
          });
        }
      })
      .catch(() => setLookupFailed(true));
  }, []);

  // Lets the customer keep the link that actually works later — the token is the only
  // way to read this order without signing in.
  const trackingLink = useMemo(
    () =>
      typeof window !== 'undefined' && orderId !== 'HDR-UNKNOWN'
        ? `${window.location.origin}/checkout/success?order=${encodeURIComponent(orderId)}${
            token ? `&token=${encodeURIComponent(token)}` : ''
          }`
        : '',
    [orderId, token]
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(trackingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

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

        {/* Tracking link. Order lookup requires both the order number and this token. */}
        {trackingLink && !lookupFailed && (
          <div className="bg-white border border-charcoal/10 p-4 mb-8 text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] tracking-widest uppercase font-medium text-charcoal mb-1">Your tracking link</p>
                <p className="text-[11px] text-chrome break-all">{trackingLink}</p>
              </div>
              <button
                type="button"
                onClick={copyLink}
                aria-label="Copy tracking link"
                className="shrink-0 inline-flex items-center gap-1.5 border border-charcoal/15 px-3 py-2 text-[10px] tracking-widest uppercase text-charcoal hover:bg-off-white transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[10px] text-chrome/70 mt-2">
              Keep this link to check your order status. Anyone with it can view this order.
            </p>
          </div>
        )}

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