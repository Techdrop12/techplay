// src/lib/cart.ts

export const STORAGE_KEY = 'cart'

export type CartItem = {
  _id: string
  slug: string
  title: string
  image: string
  price: number
  quantity: number
}

export type CartInput = Omit<CartItem, 'quantity'> & { quantity?: number }

// ---------- Utils ----------

const isBrowser = typeof window !== 'undefined'

function sanitizeItem(i: any): CartItem | null {
  if (!i) return null
  const _id = String(i._id ?? '')
  const slug = String(i.slug ?? '')
  if (!_id || !slug) return null
  const title = String(i.title ?? 'Produit')
  const image = String(i.image ?? '/placeholder.png')
  const price = Number(i.price)
  const quantity = Math.max(1, Number(i.quantity ?? 1))
  if (!Number.isFinite(price)) return null
  return { _id, slug, title, image, price, quantity }
}

function parseCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map(sanitizeItem).filter(Boolean) as CartItem[]
}

// ---------- Read / Write ----------

export function getCart(): CartItem[] {
  if (!isBrowser) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? parseCart(JSON.parse(raw)) : []
  } catch {
    return []
  }
}

export function saveCart(cart: CartItem[]): void {
  if (!isBrowser) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    // notifie les autres onglets & les listeners locaux
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }))
  } catch {
    // quota plein → on évite de crasher
    // eslint-disable-next-line no-console
    console.warn('[cart] unable to persist cart')
  }
}

// ---------- Derived values ----------

export const cartCount = (cart: CartItem[]) =>
  (cart || []).reduce((s, it) => s + Math.max(1, Number(it.quantity || 1)), 0)

export const cartTotal = (cart: CartItem[]) =>
  (cart || []).reduce((s, it) => s + (Number(it.price) || 0) * Math.max(1, Number(it.quantity || 1)), 0)

// ---------- Pure helpers (renvoient un nouveau panier) ----------

export function addItem(cart: CartItem[], input: CartInput): CartItem[] {
  const item = sanitizeItem({ ...input, quantity: Math.max(1, Number(input.quantity ?? 1)) })
  if (!item) return cart
  const idx = cart.findIndex((it) => it._id === item._id)
  if (idx >= 0) {
    const next = [...cart]
    next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity }
    return next
  }
  return [...cart, item]
}

export function updateQuantity(cart: CartItem[], id: string, quantity: number): CartItem[] {
  const q = Math.max(1, Number(quantity || 1))
  return cart.map((it) => (it._id === id ? { ...it, quantity: q } : it))
}

export function removeItem(cart: CartItem[], id: string): CartItem[] {
  return cart.filter((it) => it._id !== id)
}

export function clearCart(): CartItem[] {
  return []
}

export const isInCart = (cart: CartItem[], id: string) => cart.some((it) => it._id === id)
export const getItemQuantity = (cart: CartItem[], id: string) =>
  cart.find((it) => it._id === id)?.quantity || 0

// ---------- Live sync helpers ----------

/**
 * Écoute les changements de panier (autres onglets + writes locaux).
 * Retourne une fonction de cleanup à appeler dans useEffect.
 */
export function subscribeToCart(cb: (cart: CartItem[]) => void): () => void {
  if (!isBrowser) return () => {}
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb(getCart())
  }
  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent<CartItem[]>).detail
    if (detail) cb(detail)
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener('cart-updated', onCustom as EventListener)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('cart-updated', onCustom as EventListener)
  }
}
