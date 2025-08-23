// src/lib/wishlist.ts — compat utils (hors React). Garde la même API qu'avant.
const STORAGE_KEY = 'wishlist'
const MAX_ITEMS = 20
const isBrowser = () => typeof window !== 'undefined'

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
    return getWishlist().some((p) => String(p?._id) === String(productId))
  } catch {
    return false
  }
}

export function toggleWishlistItem(product: any): void {
  if (!isBrowser() || !product?._id) return
  try {
    let list = getWishlist()
    const exists = list.find((p) => String(p._id) === String(product._id))
    if (exists) {
      list = list.filter((p) => String(p._id) !== String(product._id))
    } else {
      list.unshift(product)
      list = list.slice(0, MAX_ITEMS)
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    window.dispatchEvent(new Event('storage'))
  } catch {}
}
