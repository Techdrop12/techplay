// src/app/[locale]/wishlist/page.tsx — FINAL (i18n + hook unifié)
'use client'

import { useEffect, useMemo } from 'react'
import SEOHead from '@/components/SEOHead'
import ProductCard from '@/components/ProductCard'
import { useWishlist } from '@/hooks/useWishlist'
import { sendEvent } from '@/lib/analytics'
import type { Product } from '@/types/product'

export default function WishlistPage({ params }: { params: { locale: string } }) {
  const { items = [], count } = useWishlist()

  // Typage fort des items
  const wishlist: Product[] = useMemo(() => items as unknown as Product[], [items])

  // Tracking vue de page
  useEffect(() => {
    try {
      sendEvent?.('wishlist_view', { count: count ?? wishlist.length })
    } catch {}
  }, [count, wishlist.length])

  const isFr = String(params?.locale || '').toLowerCase().startsWith('fr')
  const title = isFr ? 'Votre wishlist' : 'Your wishlist'
  const description = isFr
    ? 'Retrouvez tous vos produits favoris.'
    : 'See all your favorite products.'

  return (
    <>
      <SEOHead title={`${title} | TechPlay`} description={description} />
      <main className="max-w-6xl mx-auto px-4 py-10" aria-labelledby="wishlist-title">
        <h1
          id="wishlist-title"
          className="text-3xl font-bold mb-6 text-center text-brand dark:text-brand-light"
        >
          {title}
        </h1>

        {wishlist.length === 0 ? (
          <div className="text-center text-gray-500 mt-12" role="status">
            <p className="text-lg">
              {isFr ? 'Votre wishlist est vide.' : 'Your wishlist is empty.'}
            </p>
            <p className="text-sm mt-2">
              {isFr
                ? 'Parcourez nos produits et ajoutez vos favoris pour les retrouver ici.'
                : 'Browse products and add favorites to see them here.'}
            </p>
          </div>
        ) : (
          <section
            aria-label={isFr ? 'Produits en wishlist' : 'Wishlist products'}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {wishlist.map((product, i) =>
              product ? (
                <ProductCard
                  key={product._id ?? product.slug ?? i}
                  product={{
                    ...product,
                    title: product.title ?? (isFr ? 'Produit' : 'Product'),
                    image: product.image ?? '/placeholder.png',
                  }}
                />
              ) : null
            )}
          </section>
        )}
      </main>
    </>
  )
}
