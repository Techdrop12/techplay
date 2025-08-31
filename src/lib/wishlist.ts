// src/lib/wishlist.ts — compat utils (hors React). Garde la même API qu'avant.
const STORAGE_KEY = 'wishlist'
const MAX_ITEMS = Number.parseInt(process.env.NEXT_PUBLIC_WISHLIST_LIMIT ?? '50', 10)
const isBrowser = () => typeof window !== 'undefined'

function normalizeId(idLike: unknown): string {
  return String(idLike ?? '').trim()
}

function toCanonical(product: any): { id: string } & Record<string, any> | null {
  if (!product || typeof product !== 'object') return null
  const id = normalizeId(product.id ?? product._id)
  if (!id) return null
  return { ...product, id }
}

export function getWishlist(): any[] {
  if (!isBrowser()) return []
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') || []
  } catch {
    return []
  }
}

export function isInWishlist(productId: string): boolean {
  if (!isBrowser()) return false
  try {
    const cid = normalizeId(productId)
    if (!cid) return false
    return getWishlist().some((p) => normalizeId(p?.id ?? p?._id) === cid)
  } catch {
    return false
  }
}

export function toggleWishlistItem(product: any): void {
  if (!isBrowser()) return
  const c = toCanonical(product)
  if (!c) return

  try {
    let list = getWishlist()
    const exists = list.find((p) => normalizeId(p?.id ?? p?._id) === c.id)

    if (exists) {
      list = list.filter((p) => normalizeId(p?.id ?? p?._id) !== c.id)
    } else {
      list.unshift(c)
      if (list.length > MAX_ITEMS) list = list.slice(0, MAX_ITEMS)
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    // 🔔 Intra-onglet (composants React à l’écoute)
    window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: list }))
    // ℹ️ Inter-onglets natif: le setItem déclenche 'storage' sur les autres onglets
  } catch {}
}
