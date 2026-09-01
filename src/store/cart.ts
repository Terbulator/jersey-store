import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  colorHex: string;
  quantity: number;
  slug: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  referralCode: string;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (open?: boolean) => void;
  totalItems: () => number;
  totalPrice: () => number;
  setReferral: (code: string) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      referralCode: '',

      addItem: (item) => {
        const existing = get().items.find((i) => i.variantId === item.variantId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
            isOpen: true,
          });
        } else {
          set({ items: [...get().items, item], isOpen: true });
        }
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        const clamped = Math.min(quantity, 100);
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: clamped } : i
          ),
        });
      },

      clearCart: () => set({ items: [], referralCode: '' }),
      toggleCart: (open) => set({ isOpen: open ?? !get().isOpen }),

      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      totalPrice: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),

      setReferral: (code) => set({ referralCode: code }),
    }),
    {
      name: 'jersey-store-cart',
      partialize: (state) => ({ items: state.items, referralCode: state.referralCode }),
    }
  )
);
