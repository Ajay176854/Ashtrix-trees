import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],  // [{ product, size, quantity }]
      coupon: null,
      discount: 0,

      addItem: (product, size, quantity = 1) => {
        const items = get().items
        const idx = items.findIndex(
          i => i.product.id === product.id && i.size === size
        )
        if (idx >= 0) {
          const updated = [...items]
          updated[idx].quantity += quantity
          set({ items: updated })
        } else {
          set({ items: [...items, { product, size, quantity }] })
        }
      },

      removeItem: (productId, size) =>
        set({ items: get().items.filter(i => !(i.product.id === productId && i.size === size)) }),

      updateQty: (productId, size, quantity) => {
        if (quantity < 1) return get().removeItem(productId, size)
        set({
          items: get().items.map(i =>
            i.product.id === productId && i.size === size ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [], coupon: null, discount: 0 }),

      setCoupon: (coupon, discount) => set({ coupon, discount }),
      removeCoupon: () => set({ coupon: null, discount: 0 }),

      get subtotal() {
        return get().items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0)
      },

      get shipping() {
        const sub = get().items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0)
        return sub >= 599 ? 0 : 45
      },

      get total() {
        const sub = get().items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0)
        const ship = sub >= 599 ? 0 : 45
        return sub - get().discount + ship
      },

      get itemCount() {
        return get().items.reduce((s, i) => s + i.quantity, 0)
      },
    }),
    {
      name: 'ashtrix-cart',
      onRehydrateStorage: () => (state) => {
        console.log('Cart state rehydrated')
      }
    }
  )
)
