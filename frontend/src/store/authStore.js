import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,

      setAuth: (token, refreshToken, user) =>
        set({ token, refreshToken, user }),

      setUser: (user) => set({ user }),

      logout: () => set({ token: null, refreshToken: null, user: null }),

      isAdmin: () => get().user?.role === 'admin',
    }),
    { name: 'ashtrix-auth' }
  )
)
