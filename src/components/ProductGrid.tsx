'use client'

import { useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import ProductSkeleton from '@/components/ProductSkeleton'
import type { Product } from '@/types/product'

interface ProductGridProps {
  products: Product[]
  emptyMessage?: string
  /** Affiche des squelettes pendant un fetch */
  isLoading?: boolean
  /** S’il reste des produits à charger (pagination) */
  hasMore?: boolean
  /** Callback appelé pour charger la suite */
  onLoadMore?: () => void
  /** Active l’auto load (sentinelle en bas de liste) */
  observeMore?: boolean
  /** Nombre de squelettes à afficher quand isLoading */
  loadingCount?: number
  /** Ajoute l’icône wishlist sur les cards */
  showWishlistIcon?: boolean
}

export default function ProductGrid({
  products,
  emptyMessage,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  observeMore = true,
  loadingCount = 8,
  showWishlistIcon = false,
}: ProductGridProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Observe la sentinelle pour charger automatiquement la suite
  useEffect(() => {
    if (!observeMore || !hasMore || !onLoadMore || !sentinelRef.current) return
    const el = sentinelRef.current

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          onLoadMore()
        }
      },
      { rootMargin: '200px 0px 400px 0px' }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [observeMore, hasMore, onLoadMore])

  const isEmpty = useMemo(() => !products || products.length === 0, [products])

  if (isEmpty && !isLoading) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400" role="status">
        {emptyMessage || 'Aucun produit trouvé.'}
      </div>
    )
  }

  return (
    <>
      <AnimatePresence mode="popLayout">
        <motion.div
          key="grid"
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
          aria-live="polite"
          role="list"
        >
          {/* Produits */}
          {products.map((product) => (
            <motion.div key={product._id} layout role="listitem">
              <ProductCard product={product} showWishlistIcon={showWishlistIcon} />
            </motion.div>
          ))}

          {/* Squelettes pendant chargement */}
          {isLoading &&
            Array.from({ length: loadingCount }).map((_, i) => (
              <div key={`skeleton-${i}`} aria-hidden="true">
                <ProductSkeleton />
              </div>
            ))}
        </motion.div>
      </AnimatePresence>

      {/* Bouton “Charger plus” (fallback / accessibilité) */}
      {(hasMore || isLoading) && onLoadMore && (
        <div className="flex items-center justify-center mt-8">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoading}
            className="rounded-lg bg-accent text-white px-5 py-2 font-semibold shadow hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 disabled:opacity-60"
            aria-label="Charger plus de produits"
          >
            {isLoading ? 'Chargement…' : 'Charger plus'}
          </button>
        </div>
      )}

      {/* Sentinelle pour l’infinite scroll (non visible) */}
      {observeMore && hasMore && <div ref={sentinelRef} className="h-1" aria-hidden="true" />}
    </>
  )
}
