// src/app/[locale]/wishlist/page.tsx — FINAL (i18n + hook unifié)
'use client'

import { useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import SEOHead from '@/components/SEOHead'
import ProductCard from '@/components/ProductCard'
import { useWishlist } from '@/hooks/useWishlist'
import { sendEvent } from '@/lib/analytics'
import type { Product } from '@/types/product'

export default function WishlistPage() {
  const tSeo = useTranslations('seo')
  const t = useTranslations('wishlist')

  const { items = [], count } = useWishlist()
  const wishlist: Product[] = useMemo(() => items as unknown as Product[], [items])

  // Tracking vue de page
  useEffect(() => {
    try {
      sendEvent?.('wishlist_view', { count: count ?? wishlist.length })
    } catch {}
  }, [count, wishlist.length])

  return (
    <>
      <SEOHead
        title={`${tSeo('wishlist_title')} | TechPlay`}
        description={tSeo('wishlist_description')}
      />

      <main className="max-w-6xl mx-auto px-4 py-10" aria-labelledby="wishlist-title">
        <h1
          id="wishlist-title"
          className="text-3xl font-bold mb-6 text-center text-brand dark:text-brand-light"
        >
          {t('title')}
        </h1>

        {wishlist.length === 0 ? (
          <div className="text-center text-gray-500 mt-12" role="status">
            <p className="text-lg">{t('empty')}</p>
            {/* petit hint encourageant ? on reste simple */}
          </div>
        ) : (
          <section
            aria-label={t('title')}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {wishlist.map((product, i) =>
              product ? (
                <ProductCard
                  key={(product as any)._id ?? (product as any).slug ?? i}
                  product={{
                    ...product,
                    title: product.title ?? 'Product',
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
