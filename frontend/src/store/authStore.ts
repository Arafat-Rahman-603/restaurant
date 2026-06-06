import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomerUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface AuthStore {
  user: CustomerUser | null;
  token: string | null;
  setAuth: (user: CustomerUser, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<CustomerUser>) => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('customer_token', token);
          localStorage.setItem('customer_user', JSON.stringify(user));
        }
        set({ user, token });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('customer_token');
          localStorage.removeItem('customer_user');
        }
        set({ user: null, token: null });
      },
      updateUser: (fields) => {
        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, ...fields };
          if (typeof window !== 'undefined') {
            localStorage.setItem('customer_user', JSON.stringify(updatedUser));
          }
          return { user: updatedUser };
        });
      },
      isLoggedIn: () => !!get().token,
    }),
    { name: 'takeout-customer-auth', skipHydration: true }
  )
);
