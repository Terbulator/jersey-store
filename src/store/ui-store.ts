'use client';

import { create } from 'zustand';

interface UIState {
  menuOpen: boolean;
  searchOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
}

export const useUiStore = create<UIState>((set) => ({
  menuOpen: false,
  searchOpen: false,
  setMenuOpen: (v) => set({ menuOpen: v }),
  setSearchOpen: (v) => set({ searchOpen: v }),
}));