'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { ROUTES } from '@/lib/utils';
import { slideInRight, drawerBackdrop, quickAddSlide, EASE_PREMIUM } from '@/components/motion/motion-variants';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeCart();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, closeCart]);

  const shipping = subtotal() > 999 ? 0 : 99;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={drawerBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/40 z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            role="dialog"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-olive/10">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-navy">Your Bag</h2>
                <span className="text-[11px] text-chrome">({itemCount()})</span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 -mr-2 text-chrome hover:text-red transition-colors duration-200"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: EASE_PREMIUM }}
                  >
                    <svg className="w-12 h-12 text-chrome/30 mb-4" strokeWidth={1} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v18a2 2 0 002 2h12a2 2 0 002-2v-7" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 13h8" />
                    </svg>
                  </motion.div>
                  <p className="text-sm font-medium tracking-wide text-navy">YOUR BAG IS EMPTY.</p>
                  <p className="text-xs text-chrome mt-1.5 mb-6">Add something to get started.</p>
                  <Link
                    href={ROUTES.SHOP}
                    onClick={closeCart}
                    className="px-7 py-3 bg-navy text-off-white text-[11px] tracking-[0.15em] uppercase hover:bg-gold hover:text-navy transition-colors duration-300"
                  >
                    Shop the Collection
                  </Link>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  <div className="space-y-0">
                    {items.map((item) => (
                      <motion.div
                        key={`${item.product.id}-${item.size}`}
                        layout
                        variants={quickAddSlide}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <div className="flex gap-4 py-4 border-b border-olive/10 last:border-0">
                          <Link
                            href={`/shop/products/${item.product.slug}`}
                            onClick={closeCart}
                            className="w-20 h-24 flex-shrink-0 bg-off-white overflow-hidden"
                          >
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/shop/products/${item.product.slug}`}
                              onClick={closeCart}
                              className="text-xs font-medium text-navy hover:text-red transition-colors tracking-wide block truncate"
                            >
                              {item.product.name}
                            </Link>
                            <p className="text-[10px] text-chrome mt-0.5 tracking-wider uppercase">
                              {item.product.edition === 'player'
                                ? 'Player Version'
                                : item.product.edition === 'master'
                                ? 'Master Edition'
                                : 'Special Edition'}
                              {' · '}
                              Size {item.size}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center border border-olive/15">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="w-8 h-8 flex items-center justify-center text-chrome hover:bg-off-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" strokeWidth={1.5} />
                                </button>
                                <span className="w-8 h-8 flex items-center justify-center text-[11px] font-medium text-navy">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center text-chrome hover:bg-off-white transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" strokeWidth={1.5} />
                                </button>
                              </div>
                              <p className="text-xs font-bold text-navy">
                                {formatPrice(item.product.basePrice * item.quantity)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.size)}
                            className="text-[10px] text-chrome hover:text-red transition-colors self-start mt-0.5 tracking-wider"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            Remove
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-olive/10 space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-chrome">Subtotal</span>
                  <span className="font-medium text-navy">{formatPrice(subtotal())}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-chrome">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium text-navy'}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-chrome/50">Free shipping on orders above ₹999</p>
                )}

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-6 pt-2 border-t border-olive/10">
                  <div className="flex items-center gap-1.5 text-[10px] text-chrome/60">
                    <Truck className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-chrome/60">
                    <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-chrome/60">
                    <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Easy Returns</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full text-center py-3.5 bg-red text-off-white text-[11px] tracking-[0.15em] uppercase hover:bg-navy transition-colors duration-300"
                >
                  Checkout · {formatPrice(subtotal() + shipping)}
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="block w-full text-center py-3 border border-olive/15 text-[11px] tracking-[0.15em] uppercase text-navy hover:bg-off-white transition-colors duration-300"
                >
                  View Bag
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}