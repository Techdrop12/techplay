'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Star } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { memo, useMemo, useState } from 'react'

import type { Product } from '@/types/product'

import FreeShippingBadge from '@/components/FreeShippingBadge'
import Link from '@/components/LocalizedLink'
import WishlistButton from '@/components/WishlistButton'
import { pushDataLayer } from '@/lib/ga'
import { getCurrentLocale } from '@/lib/i18n-routing'
import { logEvent } from '@/lib/logEvent'
import { safeProductImageUrl } from '@/lib/safeProductImage'
import { cn, formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  className?: string
  priority?: boolean
}

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYikiIGZpbGw9IiNlZWUiIC8+PC9zdmc+'

function getImage(product: Product): string {
  if (typeof product.image === 'string' && product.image.trim()) {
    return safeProductImageUrl(product.image.trim())
  }

  if (Array.isArray(product.images)) {
    const first = product.images.find((img) => typeof img === 'string' && img.trim())
    if (first) return safeProductImageUrl(first)
  }

  if (Array.isArray(product.gallery)) {
    const first = product.gallery.find((img) => typeof img === 'string' && img.trim())
    if (first) return safeProductImageUrl(first)
  }

  return '/og-image.jpg'
}

function getTitle(product: Product): string {
  return product.title?.trim() || 'Produit'
}

function getDescription(product: Product): string | undefined {
  return typeof product.description === 'string' && product.description.trim()
    ? product.description.trim()
    : undefined
}

function getOldPrice(product: Product): number | undefined {
  return typeof product.oldPrice === 'number' && product.oldPrice > product.price
    ? product.oldPrice
    : undefined
}

function getRatingValue(product: Product): number {
  if (product.aggregateRating && typeof product.aggregateRating.average === 'number') {
    return Math.max(0, Math.min(5, product.aggregateRating.average))
  }

  if (typeof product.rating === 'number') {
    return Math.max(0, Math.min(5, product.rating))
  }

  return 0
}

function getReviewsCount(product: Product): number {
  if (product.aggregateRating && typeof product.aggregateRating.total === 'number') {
    return Math.max(0, product.aggregateRating.total)
  }

  if (typeof product.reviewsCount === 'number') {
    return Math.max(0, product.reviewsCount)
  }

  if (Array.isArray(product.reviews)) {
    return product.reviews.length
  }

  return 0
}

function ProductCard({
  product,
  className,
  priority = false,
}: ProductCardProps) {
  const pathname = usePathname() || '/'
  const locale = getCurrentLocale(pathname)
  const prefersReducedMotion = useReducedMotion()

  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const title = useMemo(() => getTitle(product), [product])
  const description = useMemo(() => getDescription(product), [product])
  const image = useMemo(() => (imgError ? '/og-image.jpg' : getImage(product)), [product, imgError])
  const oldPrice = useMemo(() => getOldPrice(product), [product])
  const ratingValue = useMemo(() => getRatingValue(product), [product])
  const reviewsCount = useMemo(() => getReviewsCount(product), [product])

  const href = product.slug ? `/products/${product.slug}` : '/products'
  const productId = String(product._id || product.slug || '')
  const hasDiscount = typeof oldPrice === 'number' && oldPrice > product.price
  const discountPct = hasDiscount ? Math.round(((oldPrice - product.price) / oldPrice) * 100) : null

  const outOfStock = typeof product.stock === 'number' && product.stock <= 0
  const lowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= 5

  const t =
    locale === 'en'
      ? {
          new: 'New',
          best: 'Best seller',
          lowStock: 'Low stock',
          outOfStock: 'Out of stock',
          inStock: 'In stock',
          seeProduct: 'View product',
          reviews: 'reviews',
          productAria: `Product: ${title}`,
          save: 'Save',
        }
      : {
          new: 'Nouveau',
          best: 'Best seller',
          lowStock: 'Stock faible',
          outOfStock: 'Rupture',
          inStock: 'En stock',
          seeProduct: 'Voir le produit',
          reviews: 'avis',
          productAria: `Produit : ${title}`,
          save: 'Économie',
        }

  const handleClick = () => {
    try {
      logEvent({
        action: 'product_card_click',
        category: 'engagement',
        label: product.slug || product._id,
        value: product.price,
      })
    } catch {
      // no-op
    }

    try {
      pushDataLayer({
        event: 'select_item',
        item_list_name: 'product_grid',
        items: [
          {
            item_id: product._id,
            item_name: title,
            price: product.price,
            item_category: product.category,
            item_brand: product.brand,
          },
        ],
      })
    } catch {
      // no-op
    }
  }

  return (
    <motion.article
      itemScope
      itemType="https://schema.org/Product"
      aria-label={t.productAria}
      data-product-id={productId || product.slug}
      className={cn(
        'group relative rounded-[1.75rem] p-[1px]',
        'bg-gradient-to-b from-white/65 via-white/10 to-white/0 dark:from-white/15 dark:via-white/5 dark:to-transparent',
        'shadow-[0_22px_70px_rgba(15,23,42,0.55)]',
        'transition-all duration-300 ease-[var(--ease-smooth)] hover:shadow-[0_26px_90px_rgba(15,23,42,0.85)] hover:-translate-y-1',
        className
      )}
      whileHover={!prefersReducedMotion ? { y: -4 } : undefined}
      transition={{ duration: 0.28, ease: [0.33, 1, 0.68, 1] }}
    >
      <meta itemProp="name" content={title} />
      <meta itemProp="image" content={image} />
      {product.brand ? <meta itemProp="brand" content={product.brand} /> : null}
      {product.sku ? <meta itemProp="sku" content={product.sku} /> : null}

      <div
        className={cn(
          'relative overflow-hidden rounded-[1.55rem]',
          'bg-[hsl(var(--surface))]/98 dark:bg-[hsl(var(--surface))]/92 supports-[backdrop-filter]:backdrop-blur-2xl',
          'border border-white/60/60 dark:border-white/5'
        )}
      >
        <WishlistButton
          product={{
            _id: product._id,
            slug: product.slug,
            title,
            price: product.price,
            image,
          }}
          floating
          className="z-20"
        />

        <Link
          href={href}
          prefetch={false}
          className="block rounded-[inherit] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950/80"
          onClick={handleClick}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.45rem] bg-[hsl(var(--surface-2))]">
            <div className="absolute inset-0">
              <Image
                src={image}
                alt={title}
                fill
                sizes="(min-width:1280px) 22vw, (min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 ease-[var(--ease-smooth)] will-change-transform group-hover:scale-[1.06]"
                priority={priority}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                quality={88}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                draggable={false}
              />

              {!imgLoaded && (
                <div
                  className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-200/75 via-slate-100/40 to-white/10 dark:from-slate-800/65 dark:via-slate-900/40 dark:to-slate-950/80"
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1.5 sm:left-4 sm:top-4">
              {product.isNew ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-950 shadow-[0_12px_35px_rgba(4,120,87,0.75)] ring-1 ring-emerald-900/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-900/90 shadow-[0_0_0_4px_rgba(187,247,208,0.75)]" />
                  {t.new}
                </span>
              ) : null}

              {product.isBestSeller ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950 shadow-[0_12px_35px_rgba(120,53,15,0.6)] ring-1 ring-amber-900/35">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-700 shadow-[0_0_0_4px_rgba(253,230,138,0.75)]" />
                  {t.best}
                </span>
              ) : null}

              {discountPct ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-50 shadow-[0_12px_35px_rgba(127,29,29,0.7)] ring-1 ring-red-900/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-200 shadow-[0_0_0_4px_rgba(248,113,113,0.75)]" />
                  -{discountPct}%
                </span>
              ) : null}

              {lowStock ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950 shadow-[0_10px_28px_rgba(180,83,9,0.35)] ring-1 ring-amber-800/35 dark:bg-amber-400/90 dark:text-amber-950">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-700 shadow-[0_0_0_4px_rgba(253,230,138,0.7)]" />
                  {t.lowStock}
                </span>
              ) : null}
            </div>

            {ratingValue > 0 ? (
              <div className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1.5 text-[11px] shadow-[0_14px_40px_rgba(15,23,42,0.8)] backdrop-blur-xl sm:right-4 sm:top-4">
                <span className="inline-flex items-center gap-1.5 text-amber-50">
                  <Star size={12} className="fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
                  <span className="font-semibold tabular-nums">{ratingValue.toFixed(1)}</span>
                </span>
              </div>
            ) : null}

            {outOfStock ? (
              <div className="absolute inset-0 grid place-items-center bg-black/55 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                {t.outOfStock}
              </div>
            ) : null}

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 via-black/10 to-transparent"
              aria-hidden="true"
            />
          </div>

          <div className="p-4 sm:p-5">
            <div className="min-h-[3.25rem]">
              {product.brand || product.category ? (
                <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-token-text/60">
                  {[product.brand, product.category].filter(Boolean).join(' · ')}
                </p>
              ) : null}

              <h3
                className="line-clamp-2 text-[15px] font-semibold text-gray-900 dark:text-white sm:text-[17px]"
                title={title}
              >
                {title}
              </h3>
            </div>

            {description ? (
              <p className="mt-2 line-clamp-2 text-[13px] text-gray-600 dark:text-gray-400">
                {description}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {reviewsCount > 0 ? (
                <p className="text-[11px] text-token-text/70">
                  {ratingValue.toFixed(1)} · {reviewsCount} {t.reviews}
                </p>
              ) : null}

              <FreeShippingBadge price={product.price} minimal />
            </div>

            <div
              className="mt-4 flex flex-wrap items-end gap-3"
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <meta itemProp="priceCurrency" content="EUR" />
              <meta itemProp="price" content={product.price.toFixed(2)} />
              <link
                itemProp="availability"
                href={outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'}
              />

              <span className="text-lg font-extrabold tracking-tight text-[hsl(var(--accent))] sm:text-xl">
                {formatPrice(product.price)}
              </span>

              {hasDiscount ? (
                <>
                  <span className="text-xs text-gray-400 line-through dark:text-gray-500">
                    {formatPrice(oldPrice)}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-[3px] text-[11px] font-semibold text-emerald-800 shadow-[0_8px_24px_rgba(16,185,129,0.45)] dark:bg-emerald-900/40 dark:text-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.5)]" />
                    {t.save} {formatPrice(oldPrice - product.price)}
                  </span>
                </>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--accent))]">
                {t.seeProduct}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  <path
                    fill="currentColor"
                    d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z"
                  />
                </svg>
              </span>

              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
                  outOfStock
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                    : lowStock
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current/80" />
                {outOfStock ? t.outOfStock : lowStock ? t.lowStock : t.inStock}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </motion.article>
  )
}

export default memo(ProductCard)