'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/storefront-types';

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  removeItem: (productId: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (product) => {
        set((state) => {
          const exists = state.items.some((item) => item.id === product.id);
          if (exists) {
            return { items: state.items.filter((item) => item.id !== product.id) };
          }
          return { items: [...state.items, product] };
        });
      },

      isWishlisted: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
    }),
    { name: 'headerr-wishlist' }
  )
);
