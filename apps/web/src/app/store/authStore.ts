import { create } from 'zustand';
import type { AppUser } from '@swift-support/shared';

interface AuthState {
  user: AppUser | null;
  isHydrating: boolean;
  setUser: (user: AppUser | null) => void;
  setHydrating: (hydrating: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrating: true,
  setUser: (user) => set({ user }),
  setHydrating: (hydrating) => set({ isHydrating: hydrating }),
}));
