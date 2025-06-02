const STORAGE_KEY = 'recentProducts'

export function getRecentProducts() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.warn('❌ Erreur lecture recentProducts:', err)
    return []
  }
}

export function addRecentProduct(product) {
  if (typeof window === 'undefined' || !product?.slug) return

  try {
    const current = getRecentProducts()
    const filtered = current.filter(p => p.slug !== product.slug)
    const updated = [product, ...filtered].slice(0, 6)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn('❌ Erreur écriture recentProducts:', err)
  }
}
