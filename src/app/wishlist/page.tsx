'use client'

import { useEffect, useMemo } from 'react'
import { useWishlist } from '@/hooks/useWishlist'
import ProductCard from '@/components/ProductCard'
import { sendEvent } from '@/lib/analytics'
import type { Product } from '@/types/product'

export default function WishlistPage() {
  // le hook expose `items`, pas `wishlist`
  const { items = [], count } = useWishlist()

  // si tu veux typer fort les items comme Product
  const wishlist: Product[] = useMemo(() => items as unknown as Product[], [items])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof sendEvent === 'function') {
        sendEvent('wishlist_view', { count: count ?? wishlist.length })
      }
    } catch {}
  }, [count, wishlist.length])

  return (
    <main className="max-w-6xl mx-auto px-4 py-10" aria-labelledby="wishlist-title">
      <h1
        id="wishlist-title"
        className="text-3xl font-bold mb-6 text-center text-brand dark:text-brand-light"
      >
        Ma wishlist
      </h1>

      {wishlist.length === 0 ? (
        <div className="text-center text-gray-500 mt-12" role="status">
          <p className="text-lg">Votre wishlist est vide.</p>
          <p className="text-sm mt-2">
            Explorez nos produits et ajoutez vos favoris pour les retrouver ici.
          </p>
        </div>
      ) : (
        <section
          aria-label="Produits en wishlist"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 fade-in"
          role="list"
        >
          {wishlist.map((product, i) =>
            product ? (
              <ProductCard
                key={product._id ?? product.slug ?? i}
                product={{
                  ...product,
                  title: product.title ?? 'Produit',
                  image: product.image ?? '/placeholder.png',
                }}
              />
            ) : null
          )}
        </section>
      )}
    </main>
  )
}
