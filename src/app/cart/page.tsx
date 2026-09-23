'use client';

import Link from 'next/link';
import { ShoppingBag, Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useShipping } from '@/lib/use-shipping';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCartStore();
  const { freeThreshold, rate, message } = useShipping();
  const shipping = subtotal() > freeThreshold ? 0 : rate;
  const total = subtotal() + shipping;

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal mb-8 uppercase">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-14 h-14 text-chrome/30 mx-auto mb-4" />
            <p className="text-sm text-chrome mb-1">Your cart is empty</p>
            <p className="text-xs text-chrome/60 mb-6">Add something to get started.</p>
            <Link href="/shop" className="inline-block px-8 py-3 bg-blood-red text-off-white text-[11px] tracking-widest uppercase hover:bg-charcoal transition-colors">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="text-[11px] text-chrome tracking-wider mb-2">
                {itemCount()} item{itemCount() !== 1 ? 's' : ''}
              </div>
              {items.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex gap-4 p-4 bg-white border border-charcoal/5">
                  <Link
                    href={`/shop/products/${item.product.slug}`}
                    className="w-20 h-24 sm:w-24 sm:h-32 flex-shrink-0 bg-off-white overflow-hidden"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/shop/products/${item.product.slug}`}
                          className="text-sm font-medium text-charcoal hover:text-blood-red transition-colors tracking-wide"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-[11px] text-chrome mt-0.5">
                          {item.product.edition === 'player' ? 'Player Version' : item.product.edition === 'master' ? 'Master Edition' : 'Special Edition'}
                          {' · '}Size: {item.size}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-charcoal whitespace-nowrap">
                        {formatPrice(item.product.basePrice * item.quantity)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-charcoal/15">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center text-charcoal hover:bg-off-white disabled:opacity-30 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-xs font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-charcoal hover:bg-off-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.size)}
                        className="text-[11px] text-chrome hover:text-blood-red transition-colors tracking-wider flex items-center gap-1"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase text-chrome hover:text-blood-red transition-colors mt-4"
              >
                <ArrowLeft className="w-3 h-3" />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-charcoal/5 p-6 lg:sticky lg:top-24">
                <h2 className="text-[11px] tracking-widest uppercase font-medium text-charcoal mb-4">Order Summary</h2>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-chrome">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-chrome">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-[10px] text-chrome/60">{message}</p>
                  )}
                </div>

                <div className="flex justify-between text-sm font-bold mt-4 pt-4 border-t border-charcoal/10">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full text-center py-3.5 bg-blood-red text-off-white text-[11px] tracking-widest uppercase hover:bg-charcoal transition-colors mt-6"
                >
                  Proceed to Checkout
                </Link>

                <div className="mt-4 pt-4 border-t border-charcoal/5 space-y-2">
                  {[
                    'Free shipping above ₹999',
                    '30-day easy returns',
                    'Secure checkout',
                  ].map((text) => (
                    <div key={text} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-blood-red rounded-full flex-shrink-0" />
                      <span className="text-[10px] text-chrome tracking-wider">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile spacer */}
      <div className="lg:hidden h-4" />
    </section>
  );
}
