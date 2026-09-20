'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } = useCartStore();

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeCart();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, closeCart]);

  const shipping = subtotal() > 999 ? 0 : 99;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/10">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-widest uppercase">Your Cart</h2>
            <span className="text-[11px] text-chrome">({itemCount()})</span>
          </div>
          <button onClick={closeCart} className="p-1 hover:text-blood-red transition-colors" aria-label="Close cart">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-12 h-12 text-chrome/40 mb-4" />
              <p className="text-sm text-chrome mb-1">Your cart is empty</p>
              <p className="text-xs text-chrome/60 mb-6">Add something to get started.</p>
              <button
                onClick={closeCart}
                className="px-6 py-2.5 border border-charcoal text-[11px] tracking-widest uppercase hover:bg-charcoal hover:text-off-white transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex gap-3 py-3 border-b border-charcoal/5 last:border-0">
                  <Link
                    href={`/shop/products/${item.product.slug}`}
                    onClick={closeCart}
                    className="w-20 h-24 flex-shrink-0 bg-off-white overflow-hidden"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/shop/products/${item.product.slug}`}
                      onClick={closeCart}
                      className="text-xs font-medium text-charcoal hover:text-blood-red transition-colors tracking-wide block truncate"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-[11px] text-chrome mt-0.5">
                      {item.product.edition === 'player' ? 'Player Version' : item.product.edition === 'master' ? 'Master Edition' : 'Special Edition'}
                      {' · '}
                      Size: {item.size}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-charcoal/15">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center text-charcoal hover:bg-off-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 h-7 flex items-center justify-center text-[11px] font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-charcoal hover:bg-off-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-charcoal">{formatPrice(item.product.basePrice * item.quantity)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id, item.size)}
                    className="text-[10px] text-chrome hover:text-blood-red transition-colors self-start mt-0.5 tracking-wider"
                    aria-label={`Remove ${item.product.name}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-charcoal/10 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-chrome">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal())}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-chrome">Shipping</span>
              <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                {shipping === 0 ? 'FREE' : formatPrice(shipping)}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-[10px] text-chrome/60">Free shipping on orders above ₹999</p>
            )}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center py-3.5 bg-blood-red text-off-white text-[11px] tracking-widest uppercase hover:bg-charcoal transition-colors"
            >
              Checkout · {formatPrice(subtotal() + shipping)}
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full text-center py-3 border border-charcoal/20 text-[11px] tracking-widest uppercase text-charcoal hover:bg-off-white transition-colors"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
