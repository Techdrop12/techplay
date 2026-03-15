/**
 * Helpers pour récupérer l’URL de la première et de la seconde image d’un produit.
 * Utilisé par ProductCard, CartItem, PacksSection, etc. pour un comportement cohérent.
 */

import type { Product } from '@/types/product'
import { safeProductImageUrl } from '@/lib/safeProductImage'

const FALLBACK = '/og-image.jpg'

function collectImageUrls(product: Product): string[] {
  const pool: string[] = []
  if (typeof product.image === 'string' && product.image.trim()) {
    pool.push(product.image.trim())
  }
  if (Array.isArray(product.images)) {
    pool.push(
      ...product.images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
    )
  }
  if (Array.isArray(product.gallery)) {
    pool.push(
      ...product.gallery.filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
    )
  }
  return Array.from(new Set(pool))
}

/**
 * Retourne l’URL de la première image du produit (sécurisée), ou le fallback.
 */
export function getProductImage(product: Product): string {
  const urls = collectImageUrls(product)
  const first = urls[0]
  return first ? safeProductImageUrl(first) : FALLBACK
}

/**
 * Retourne l’URL de la seconde image du produit (sécurisée), ou null s’il n’y en a qu’une.
 */
export function getProductSecondImage(product: Product): string | null {
  const urls = collectImageUrls(product).map((url) => safeProductImageUrl(url))
  if (urls.length < 2) return null
  return urls[1]
}
