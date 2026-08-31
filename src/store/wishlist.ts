import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set({ ids: get().ids.includes(id) ? get().ids.filter((i) => i !== id) : [...get().ids, id] }),
      has: (id) => get().ids.includes(id),
      remove: (id) => set({ ids: get().ids.filter((i) => i !== id) }),
    }),
    { name: 'jersey-store-wishlist' }
  )
);
