// src/context/cartContext.tsx
'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { event as gaEvent, trackAddToCart } from '@/lib/ga'

/** Storage keys */
const STORAGE_KEY = 'cart'
const CART_ID_KEY = 'cart_id'
/** Bornes de quantité */
const MIN_QTY = 1
const MAX_QTY = 99
/** Seuil livraison gratuite (utilisé pour la progression UI) */
const FREE_SHIPPING_THRESHOLD =
  Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 60)

/** Types */
export type CartItem = {
  _id: string
  slug: string
  title: string
  image: string
  price: number
  quantity: number
}

export type CartInput = Omit<CartItem, 'quantity'> & { quantity?: number }

export interface CartContextValue {
  cart: CartItem[]
  cartId: string
  // Actions
  addToCart: (item: CartInput) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  increment: (id: string, step?: number) => void
  decrement: (id: string, step?: number) => void
  clearCart: () => void
  replaceCart: (items: CartItem[]) => void
  // Sélecteurs
  count: number // nombre total d’articles (somme des quantités)
  total: number // sous-total en €
  isInCart: (id: string) => boolean
  getItemQuantity: (id: string) => number
  getItem: (id: string) => CartItem | undefined
  // Livraison gratuite (UX)
  freeShippingThreshold: number
  amountToFreeShipping: number // € restant avant livraison gratuite (0 si atteint)
  progressToFreeShipping: number // 0..100
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

/* ----------------------- Helpers ----------------------- */

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n))

const ensureItemShape = (it: Partial<CartItem>): CartItem => ({
  _id: String(it._id ?? ''),
  slug: String(it.slug ?? ''),
  title: String(it.title ?? 'Produit'),
  image: String(it.image ?? '/placeholder.png'),
  price: Number(it.price ?? 0),
  quantity: clamp(Number(it.quantity ?? 1), MIN_QTY, MAX_QTY),
})

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(Boolean).map(ensureItemShape)
  } catch {
    return []
  }
}

function writeCart(cart: CartItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    // notifie les autres onglets & composants
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }))
  } catch {
    // eslint-disable-next-line no-console
    console.warn("Impossible d’enregistrer le panier.")
  }
}

function getOrCreateCartId(): string {
  if (typeof window === 'undefined') return 'ssr'
  try {
    let id = localStorage.getItem(CART_ID_KEY)
    if (!id) {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(CART_ID_KEY, id)
    }
    return id
  } catch {
    return 'anon'
  }
}

/* ----------------------- Provider ----------------------- */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartId, setCartId] = useState<string>('anon')
  const hydrated = useRef(false)

  // Hydratation initiale
  useEffect(() => {
    setCart(readCart())
    setCartId(getOrCreateCartId())
    hydrated.current = true
  }, [])

  // Persistance
  useEffect(() => {
    if (!hydrated.current) return
    writeCart(cart)
  }, [cart])

  // Synchronisation multi-onglets
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setCart(readCart())
      if (e.key === CART_ID_KEY && e.newValue) setCartId(e.newValue)
    }
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<CartItem[]>).detail
      if (detail) setCart(detail.map(ensureItemShape))
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('cart-updated', onCustom as EventListener)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('cart-updated', onCustom as EventListener)
    }
  }, [])

  // Sélecteurs
  const count = useMemo(
    () => cart.reduce((s, it) => s + (it.quantity || 0), 0),
    [cart]
  )

  const total = useMemo(
    () =>
      // sous-total (arrondi 2 décimales pour éviter flottants sales)
      Math.round(
        cart.reduce((s, it) => s + (Number(it.price) || 0) * (it.quantity || 0), 0) * 100
      ) / 100,
    [cart]
  )

  const amountToFreeShipping = useMemo(() => {
    if (FREE_SHIPPING_THRESHOLD <= 0) return 0
    return Math.max(0, Math.round((FREE_SHIPPING_THRESHOLD - total) * 100) / 100)
  }, [total])

  const progressToFreeShipping = useMemo(() => {
    if (FREE_SHIPPING_THRESHOLD <= 0) return 100
    return clamp(Math.round((total / FREE_SHIPPING_THRESHOLD) * 100), 0, 100)
  }, [total])

  const isInCart = (id: string) => cart.some((it) => it._id === id)
  const getItemQuantity = (id: string) => cart.find((it) => it._id === id)?.quantity || 0
  const getItem = (id: string) => cart.find((it) => it._id === id)

  // Actions
  const addToCart = (input: CartInput) => {
    const item = ensureItemShape({ ...input, quantity: input.quantity ?? 1 })

    setCart((curr) => {
      const idx = curr.findIndex((it) => it._id === item._id)
      if (idx >= 0) {
        const next = [...curr]
        next[idx] = {
          ...next[idx],
          quantity: clamp(next[idx].quantity + item.quantity, MIN_QTY, MAX_QTY),
        }
        return next
      }
      return [...curr, item]
    })

    // Tracking e-commerce (tolérant)
    try {
      gaEvent?.({
        action: 'add_to_cart',
        category: 'ecommerce',
        label: item.title,
        value: item.price * item.quantity,
      })
    } catch {}
    try {
      trackAddToCart?.({
        currency: 'EUR',
        value: item.price * item.quantity,
        items: [
          {
            item_id: item._id,
            item_name: item.title,
            price: item.price,
            quantity: item.quantity,
          },
        ],
      })
    } catch {}
  }

  const removeFromCart = (id: string) => {
    setCart((curr) => curr.filter((it) => it._id !== id))
    try {
      gaEvent?.({ action: 'remove_from_cart', category: 'ecommerce', label: id, value: 0 })
    } catch {}
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (!Number.isFinite(quantity)) return
    const q = clamp(Math.trunc(quantity), MIN_QTY, MAX_QTY)
    setCart((curr) => curr.map((it) => (it._id === id ? { ...it, quantity: q } : it)))
    try {
      gaEvent?.({ action: 'update_cart_quantity', category: 'ecommerce', label: id, value: q })
    } catch {}
  }

  const increment = (id: string, step: number = 1) => {
    setCart((curr) =>
      curr.map((it) =>
        it._id === id ? { ...it, quantity: clamp(it.quantity + step, MIN_QTY, MAX_QTY) } : it
      )
    )
  }

  const decrement = (id: string, step: number = 1) => {
    setCart((curr) =>
      curr
        .map((it) =>
          it._id === id ? { ...it, quantity: clamp(it.quantity - step, MIN_QTY, MAX_QTY) } : it
        )
        // si on veut retirer quand quantité tombe à 0, décommente la ligne ci-dessous :
        // .filter((it) => it.quantity >= MIN_QTY)
    )
  }

  const clearCart = () => {
    setCart([])
    try {
      gaEvent?.({ action: 'clear_cart', category: 'ecommerce', label: 'all', value: 0 })
    } catch {}
  }

  const replaceCart = (items: CartItem[]) => {
    setCart(items.map(ensureItemShape))
  }

  const value: CartContextValue = {
    cart,
    cartId,
    addToCart,
    removeFromCart,
    updateQuantity,
    increment,
    decrement,
    clearCart,
    replaceCart,
    count,
    total,
    isInCart,
    getItemQuantity,
    getItem,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountToFreeShipping,
    progressToFreeShipping,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

/* ----------------------- Hook ----------------------- */

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider />')
  return ctx
}
