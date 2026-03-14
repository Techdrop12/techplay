'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'

import type { Product } from '@/types/product'

import ProductCard from '@/components/ProductCard'
import { useWishlist } from '@/hooks/useWishlist'
import { sendEvent } from '@/lib/analytics'
import Link from '@/components/LocalizedLink'
import BackToHomeLink from '@/components/BackToHomeLink'

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

export default function WishlistClient() {
  const t = useTranslations('wishlist')

  const wishlistState = useWishlist() as {
    items?: unknown[]
    count?: number
  }

  const items = Array.isArray(wishlistState?.items) ? wishlistState.items : []
  const count = typeof wishlistState?.count === 'number' ? wishlistState.count : items.length

  const wishlist = useMemo(() => {
    return items
      .filter(isRecord)
      .map((item) => {
        const product = item as Partial<Product> & Keyable

        return {
          ...product,
          title:
            typeof product.title === 'string' && product.title.trim()
              ? product.title
              : 'Product',
          image:
            typeof product.image === 'string' && product.image.trim()
              ? product.image
              : '/placeholder.png',
          price:
            typeof product.price === 'number' && Number.isFinite(product.price)
              ? product.price
              : 0,
        } as Product & Keyable
      })
  }, [items])

  useEffect(() => {
    try {
      sendEvent?.('wishlist_view', { count })
    } catch {
      // no-op
    }
  }, [count])

  const tCart = useTranslations('cart')

  return (
    <main
      className="container-app mx-auto max-w-6xl px-4 pt-24 pb-20 sm:px-6 lg:px-8"
      aria-labelledby="wishlist-title"
      role="main"
    >
      <header className="mb-10 text-center sm:mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent))]">
          Favoris
        </p>
        <h1 id="wishlist-title" className="heading-page mt-2">
          {t('title')}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-token-text/75">
          {wishlist.length === 0
            ? t('empty')
            : 'Retrouvez ici les produits que vous avez mis de côté. Ajoutez-les au panier en un clic.'}
        </p>
      </header>

      {wishlist.length === 0 ? (
        <section
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-sm text-center"
          aria-label="Liste vide"
        >
          <p className="text-[15px] text-token-text/75">{t('empty')}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-[15px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-md)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            >
              {tCart('view_products')}
            </Link>
            <BackToHomeLink variant="outline" prefetch={false} className="!min-h-0 py-2.5 text-[15px]" />
          </div>
        </section>
      ) : (
        <>
          <section
            aria-label={t('title')}
            className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
          >
            {wishlist.map((product, i) => (
              <ProductCard key={getProductKey(product, i)} product={product} />
            ))}
          </section>
          <p className="mt-6 text-center text-[13px] text-token-text/60">
            Sauvegardé sur cet appareil. Ajoutez au panier depuis chaque carte.
          </p>
        </>
      )}
    </main>
  )
}