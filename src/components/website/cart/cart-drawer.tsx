'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { formatPrice, ROUTES } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCartStore();
  const router = useRouter();

  const total = subtotal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-[50] bg-black/30"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="cart-drawer flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-black/10">
              <span className="font-mono-meta text-[10px] text-charcoal">Your Bag</span>
              <button onClick={closeCart} aria-label="Close cart" className="close-btn">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                <p className="headline text-2xl text-navy mb-3">EMPTY CART.</p>
                <p className="headline text-2xl text-gold mb-8">FULL POTENTIAL.</p>
                <button
                  onClick={() => {
                    closeCart();
                    router.push(ROUTES.SHOP);
                  }}
                  className="btn-pill btn-pill-dark"
                >
                  Shop the Drop
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="flex gap-4">
                      <Link
                        href={`/shop/products/${item.product.slug}`}
                        onClick={closeCart}
                        className="w-20 h-24 bg-off-white shrink-0 overflow-hidden relative"
                      >
                        <Image
                          src={item.product.image}
                          alt={item.product.imageAlt}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="headline text-lg text-navy leading-tight">
                              {item.product.name}
                            </p>
                            <p className="font-mono-meta text-[9px] text-chrome mt-1">
                              {item.size} · {item.product.category}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.size)}
                            aria-label="Remove item"
                            className="text-chrome hover:text-red transition-colors"
                          >
                            <X className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-black/10 rounded-full">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                              className="p-2 text-navy hover:text-red transition-colors"
                            >
                              <Minus className="w-3 h-3" strokeWidth={1.5} />
                            </button>
                            <span className="w-6 text-center text-sm text-navy font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.quantity + 1)
                              }
                              aria-label="Increase quantity"
                              className="p-2 text-navy hover:text-red transition-colors"
                            >
                              <Plus className="w-3 h-3" strokeWidth={1.5} />
                            </button>
                          </div>
                          <span className="text-sm text-navy font-medium">
                            {formatPrice(item.product.basePrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-6 border-t border-black/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-meta text-[10px] text-chrome">Subtotal</span>
                    <span className="text-lg text-navy font-medium">{formatPrice(total)}</span>
                  </div>
                  <p className="font-mono-meta text-[9px] text-chrome">
                    Free shipping over ₹999 · 30-day returns
                  </p>
                  <button
                    onClick={() => {
                      closeCart();
                      router.push(ROUTES.CHECKOUT);
                    }}
                    className="btn-pill btn-pill-dark w-full"
                  >
                    Checkout <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => {
                      closeCart();
                      router.push(ROUTES.SHOP);
                    }}
                    className="w-full text-center text-xs text-navy underline underline-offset-4 hover:text-red transition-colors"
                  >
                    Continue shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}