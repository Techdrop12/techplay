'use client'

import { useWishlist } from '@/hooks/useWishlist'
import ProductCard from '@/components/ProductCard'
import { useEffect } from 'react'
import { sendEvent } from '@/lib/analytics'
import type { Product } from '@/types/product'

export default function WishlistPage() {
  const { wishlist }: { wishlist: Product[] } = useWishlist()

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof sendEvent === 'function') {
      sendEvent('wishlist_view', { count: wishlist.length })
    }
  }, [wishlist.length])

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
          {wishlist.map((product) =>
            product ? (
              <ProductCard
                key={product._id}
                product={{
                  ...product,
                  title: product.title || product.name || 'Produit',
                  image: product.image || product.imageUrl || '/placeholder.png',
                }}
              />
            ) : null
          )}
        </section>
      )}
    </main>
  )
}
