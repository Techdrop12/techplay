'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'

import type { Product } from '@/types/product'

import ProductCard from '@/components/ProductCard'
import SEOHead from '@/components/SEOHead'
import { useWishlist } from '@/hooks/useWishlist'
import { sendEvent } from '@/lib/analytics'

type Keyable = {
  _id?: string | number
  slug?: string | number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getProductKey(p: Keyable, i: number): string | number {
  return p._id ?? p.slug ?? i
}

export default function WishlistPage() {
  const tSeo = useTranslations('seo')
  const t = useTranslations('wishlist')

  const { items = [], count } = useWishlist()

  const wishlist = useMemo(() => {
    if (!Array.isArray(items)) return []

    return items
      .filter(isRecord)
      .map((item) => {
        const product = item as Partial<Product> & Keyable

        return {
          ...product,
          title: typeof product.title === 'string' && product.title.trim() ? product.title : 'Product',
          image:
            typeof product.image === 'string' && product.image.trim()
              ? product.image
              : '/placeholder.png',
        } as Product & Keyable
      })
  }, [items])

  useEffect(() => {
    try {
      sendEvent?.('wishlist_view', { count: count ?? wishlist.length })
    } catch {
      // no-op
    }
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
          <div className="text-center text-gray-500 mt-12" role="status" aria-live="polite">
            <p className="text-lg">{t('empty')}</p>
          </div>
        ) : (
          <section
            aria-label={t('title')}
            className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
          >
            {wishlist.map((product, i) => (
              <ProductCard
                key={getProductKey(product, i)}
                product={product}
              />
            ))}
          </section>
        )}
      </main>
    </>
  )
}