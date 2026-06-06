'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Food } from '@/types';

interface WishlistStore {
  items: Food[];
  toggleWishlist: (food: Food) => void;
  removeItem: (foodId: string) => void;
  hasItem: (foodId: string) => boolean;
  clearWishlist: () => void;
  setItems: (items: Food[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (food) => {
        const exists = get().items.some((item) => item._id === food._id);
        if (exists) {
          set((state) => ({
            items: state.items.filter((item) => item._id !== food._id),
          }));
        } else {
          set((state) => ({
            items: [...state.items, food],
          }));
        }
      },

      removeItem: (foodId) => {
        set((state) => ({
          items: state.items.filter((item) => item._id !== foodId),
        }));
      },

      hasItem: (foodId) => {
        return get().items.some((item) => item._id === foodId);
      },

      clearWishlist: () => set({ items: [] }),
      setItems: (items) => set({ items }),
    }),
    { name: 'takeout-wishlist', skipHydration: true }
  )
);
