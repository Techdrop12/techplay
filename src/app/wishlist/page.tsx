'use client'

import { useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import { useWishlist } from '@/hooks/useWishlist'
import { sendEvent } from '@/lib/analytics'
import type { Product } from '@/types/product'

function toProduct(item: any): Product {
  return {
    _id: item._id ?? item.id ?? item.slug ?? 'unknown',
    slug: item.slug ?? item.id ?? item._id ?? 'unknown',
    title: item.title ?? 'Produit',
    price: item.price ?? 0,
    oldPrice: item.oldPrice ?? undefined,
    imageUrl: item.imageUrl ?? item.image ?? '/placeholder.png',
    image: item.image ?? item.imageUrl ?? '/placeholder.png',
    rating: item.rating ?? 0,
    description: item.description ?? '',
    category: item.category ?? undefined,
    createdAt: item.createdAt ?? undefined,
    updatedAt: item.updatedAt ?? undefined,
  } as Product
}

export default function WishlistPage() {
  const { items, count } = useWishlist()

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof sendEvent === 'function') {
      sendEvent('wishlist_view', { count })
    }
  }, [count])

  return (
    <main className="max-w-6xl mx-auto px-4 py-10" aria-labelledby="wishlist-title">
      <h1 id="wishlist-title" className="text-3xl font-bold mb-6 text-center text-brand dark:text-brand-light">
        Ma wishlist
      </h1>

      {count === 0 ? (
        <div className="text-center text-gray-500 mt-12" role="status">
          <p className="text-lg">Votre wishlist est vide.</p>
          <p className="text-sm mt-2">Explorez nos produits et ajoutez vos favoris pour les retrouver ici.</p>
        </div>
      ) : (
        <section aria-label="Produits en wishlist" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 fade-in" role="list">
          {items.map((item: any) => {
            const product = toProduct(item) as Product
            const key = String((product as any)._id ?? (product as any).id ?? product.slug)
            return <ProductCard key={key} product={product} />
          })}
        </section>
      )}
    </main>
  )
}
