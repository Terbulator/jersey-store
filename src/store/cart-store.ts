'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/storefront-types';
import { trackEvent } from '@/lib/analytics';

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, size: string, quantity?: number) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, size, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id && item.size === size
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id && item.size === size
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, size, quantity }] };
        });
        trackEvent('add_to_cart', {
          product_id: product.id,
          product_name: product.name,
          category: product.category,
          price: product.basePrice,
        });
      },

      removeItem: (productId, size) => {
        const item = get().items.find((i) => i.product.id === productId && i.size === size);
        if (item) {
          trackEvent('remove_from_cart', {
            product_id: item.product.id,
            product_name: item.product.name,
            category: item.product.category,
            price: item.product.basePrice,
          });
        }
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.size === size)
          ),
        }));
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.size === size
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      subtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.basePrice * item.quantity,
          0
        ),

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: 'headerr-cart' }
  )
);
