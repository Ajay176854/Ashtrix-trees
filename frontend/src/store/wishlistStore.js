import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { wishlistAPI } from '@/utils/api'

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      ids: [],   // product ids

      toggle: async (productId) => {
        const ids = get().ids
        if (ids.includes(productId)) {
          set({ ids: ids.filter(id => id !== productId) })
          try { await wishlistAPI.remove(productId) } catch {}
        } else {
          set({ ids: [...ids, productId] })
          try { await wishlistAPI.add(productId) } catch {}
        }
      },

      isWishlisted: (productId) => get().ids.includes(productId),

      syncFromServer: (serverIds) => set({ ids: serverIds }),
    }),
    { name: 'ashtrix-wishlist' }
  )
)
