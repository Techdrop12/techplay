'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Star } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'

import type { Product } from '@/types/product'

import FreeShippingBadge from '@/components/FreeShippingBadge'
import Link from '@/components/LocalizedLink'
import WishlistButton from '@/components/WishlistButton'
import { pushDataLayer } from '@/lib/ga'
import { getCurrentLocale } from '@/lib/i18n-routing'
import { logEvent } from '@/lib/logEvent'
import { cn, formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  className?: string
  priority?: boolean
}

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYikiIGZpbGw9IiNlZWUiIC8+PC9zdmc+'

function getImage(product: Product): string {
  if (typeof product.image === 'string' && product.image.trim()) return product.image.trim()

  if (Array.isArray(product.images)) {
    const first = product.images.find((img) => typeof img === 'string' && img.trim())
    if (first) return first
  }

  if (Array.isArray(product.gallery)) {
    const first = product.gallery.find((img) => typeof img === 'string' && img.trim())
    if (first) return first
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

export default function ProductCard({
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
        'group relative rounded-3xl p-[1px] shadow-sm transition-shadow hover:shadow-2xl',
        className
      )}
      whileHover={!prefersReducedMotion ? { y: -4 } : undefined}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <meta itemProp="name" content={title} />
      <meta itemProp="image" content={image} />
      {product.brand ? <meta itemProp="brand" content={product.brand} /> : null}
      {product.sku ? <meta itemProp="sku" content={product.sku} /> : null}

      <div
        className={cn(
          'relative overflow-hidden rounded-[inherit]',
          'bg-white/80 dark:bg-zinc-900/80 supports-[backdrop-filter]:backdrop-blur',
          'border border-white/40 dark:border-white/10 ring-1 ring-gray-200/60 dark:ring-gray-800/60'
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
          className="block rounded-[inherit] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.45)]"
          onClick={handleClick}
        >
          <div className="relative aspect-[4/3] w-full bg-gray-100 dark:bg-zinc-800">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
              priority={priority}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              quality={85}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              draggable={false}
            />

            {!imgLoaded && (
              <div
                className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200/70 to-gray-100/40 dark:from-zinc-800/60 dark:to-zinc-900/40"
                aria-hidden="true"
              />
            )}

            <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-2">
              {product.isNew ? (
                <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow">
                  {t.new}
                </span>
              ) : null}

              {product.isBestSeller ? (
                <span className="rounded-full bg-yellow-400 px-2.5 py-0.5 text-[11px] font-semibold text-black shadow">
                  {t.best}
                </span>
              ) : null}

              {discountPct ? (
                <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow">
                  -{discountPct}%
                </span>
              ) : null}

              {lowStock ? (
                <span className="rounded-full bg-amber-300/90 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 shadow">
                  {t.lowStock}
                </span>
              ) : null}
            </div>

            {ratingValue > 0 ? (
              <div className="absolute right-3 top-3 rounded-full border border-gray-200/60 bg-white/90 px-2.5 py-1 text-xs shadow backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90">
                <span className="inline-flex items-center gap-1">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{ratingValue.toFixed(1)}</span>
                </span>
              </div>
            ) : null}

            {outOfStock ? (
              <div className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-semibold text-white">
                {t.outOfStock}
              </div>
            ) : null}

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent"
              aria-hidden="true"
            />
          </div>

          <div className="p-4 sm:p-5">
            <div className="min-h-[3.25rem]">
              {product.brand || product.category ? (
                <p className="mb-1 text-[11px] uppercase tracking-wide text-token-text/60">
                  {[product.brand, product.category].filter(Boolean).join(' · ')}
                </p>
              ) : null}

              <h3
                className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-white sm:text-lg"
                title={title}
              >
                {title}
              </h3>
            </div>

            {description ? (
              <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {reviewsCount > 0 ? (
                <p className="text-xs text-token-text/70">
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

              <span className="text-lg font-extrabold text-brand sm:text-xl">
                {formatPrice(product.price)}
              </span>

              {hasDiscount ? (
                <>
                  <span className="text-sm text-gray-400 line-through dark:text-gray-500">
                    {formatPrice(oldPrice)}
                  </span>

                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {t.save} {formatPrice(oldPrice - product.price)}
                  </span>
                </>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[hsl(var(--accent))]">
                {t.seeProduct}
              </span>

              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-medium',
                  outOfStock
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                    : lowStock
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                )}
              >
                {outOfStock ? t.outOfStock : lowStock ? t.lowStock : t.inStock}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </motion.article>
  )
}