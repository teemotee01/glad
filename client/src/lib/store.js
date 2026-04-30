import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* ── Auth ───────────────────────────────────────── */
export const useAuthStore = create((set) => ({
  user:    null,
  loading: true,
  setUser:   (user) => set({ user, loading: false }),
  clearUser: ()     => set({ user: null, loading: false }),
}))

/* ── Design ─────────────────────────────────────── */
export const useDesignStore = create(
  persist(
    (set, get) => ({
      category: 'shirt',
      color:    '#2C3E50',
      measurements: { height: 175, chest: 92, waist: 78, hips: 95, shoe: 42 },
      texture:   null,
      aiResult:  null,
      saved:     [],

      setCategory: (v) => set({ category: v }),
      setColor:    (v) => set({ color: v }),
      setTexture:  (v) => set({ texture: v }),
      setAiResult: (v) => set({ aiResult: v }),
      setMeasurement: (k, v) => set(s => ({ measurements: { ...s.measurements, [k]: v } })),

      addSaved: (design) => set(s => ({
        saved: [{ ...design, id: Date.now(), savedAt: new Date().toISOString() }, ...s.saved],
      })),
      removeSaved: (id) => set(s => ({ saved: s.saved.filter(d => d.id !== id) })),

      currentDesign: () => {
        const { category, color, measurements, texture } = get()
        return { category, color, measurements, texture }
      },
    }),
    { name: 'nexus-design' }
  )
)

/* ── Restaurant ─────────────────────────────────── */
export const useRestaurantStore = create((set, get) => ({
  cart:          [],
  reservations:  [],
  selectedTable: null,

  setSelectedTable: (t) => set({ selectedTable: t }),

  addToCart: (item) => set(s => {
    const ex = s.cart.find(c => c.id === item.id)
    return {
      cart: ex
        ? s.cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
        : [...s.cart, { ...item, qty: 1 }],
    }
  }),

  updateQty: (id, qty) => set(s => ({
    cart: qty <= 0
      ? s.cart.filter(c => c.id !== id)
      : s.cart.map(c => c.id === id ? { ...c, qty } : c),
  })),

  clearCart: () => set({ cart: [] }),

  cartTotal: () => get().cart.reduce((s, i) => s + i.price * i.qty, 0),
  cartCount: () => get().cart.reduce((s, i) => s + i.qty, 0),

  addReservation: (r) => set(s => ({
    reservations: [{ ...r, id: Date.now(), status: 'confirmed' }, ...s.reservations],
  })),
}))

/* ── Dashboard ──────────────────────────────────── */
export const useDashboardStore = create((set) => ({
  aiCount:  0,
  activity: [],
  incAI: () => set(s => ({ aiCount: s.aiCount + 1 })),
  addActivity: (item) => set(s => ({
    activity: [{ ...item, id: Date.now(), time: new Date() }, ...s.activity.slice(0, 19)],
  })),
}))
