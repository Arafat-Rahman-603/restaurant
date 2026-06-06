'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Food } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (food: Food) => void;
  removeItem: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (food) => {
        const existing = get().items.find((i) => i.food._id === food._id);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.food._id === food._id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          }));
        } else {
          set((state) => ({ items: [...state.items, { food, quantity: 1 }] }));
        }
      },

      removeItem: (foodId) => {
        set((state) => ({ items: state.items.filter((i) => i.food._id !== foodId) }));
      },

      updateQuantity: (foodId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(foodId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.food._id === foodId ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, i) => {
          const price = i.food.discountPrice || i.food.price;
          return sum + price * i.quantity;
        }, 0),
    }),
    { name: 'takeout-cart', skipHydration: true }
  )
);
