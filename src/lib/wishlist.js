// src/lib/wishlist.js
const STORAGE_KEY = 'wishlist'

export function getWishlist() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || []
  } catch (e) {
    console.warn('Erreur lecture wishlist:', e)
    return []
  }
}

export function toggleWishlistItem(product) {
  if (typeof window === 'undefined') return
  try {
    const current = getWishlist()
    const exists = current.find((p) => p._id === product._id)
    const updated = exists
      ? current.filter((p) => p._id !== product._id)
      : [product, ...current]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.warn('Erreur sauvegarde wishlist:', e)
  }
}

export function isInWishlist(productId) {
  if (typeof window === 'undefined') return false
  try {
    const current = getWishlist()
    return current.some((p) => p._id === productId)
  } catch (e) {
    console.warn('Erreur isInWishlist:', e)
    return false
  }
}
