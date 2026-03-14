'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { memo, useMemo, useState } from 'react'

import type { Product } from '@/types/product'

import AddToCartButton from '@/components/AddToCartButton'
import FreeShippingBadge from '@/components/FreeShippingBadge'
import Link from '@/components/LocalizedLink'
import RatingStars from '@/components/RatingStars'
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

function getSecondImage(product: Product): string | null {
  const pool: string[] = []
  if (typeof product.image === 'string' && product.image.trim()) pool.push(product.image.trim())
  if (Array.isArray(product.images)) pool.push(...product.images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0))
  if (Array.isArray(product.gallery)) pool.push(...product.gallery.filter((img): img is string => typeof img === 'string' && img.trim().length > 0))
  const uniq = Array.from(new Set(pool)).map((url) => safeProductImageUrl(url))
  if (uniq.length < 2) return null
  return uniq[1]
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
  const _description = useMemo(() => getDescription(product), [product])
  const image = useMemo(() => (imgError ? '/og-image.jpg' : getImage(product)), [product, imgError])
  const secondImage = useMemo(() => getSecondImage(product), [product])
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
          sale: 'Sale',
          lowStock: 'Low stock',
          outOfStock: 'Out of stock',
          inStock: 'In stock',
          seeProduct: 'View product',
          addToCart: 'Add to cart',
          reviews: 'reviews',
          productAria: `Product: ${title}`,
          save: 'Save',
        }
      : {
          new: 'Nouveau',
          best: 'Best seller',
          sale: 'Promo',
          lowStock: 'Stock faible',
          outOfStock: 'Rupture',
          inStock: 'En stock',
          seeProduct: 'Voir le produit',
          addToCart: 'Ajouter au panier',
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
        'group relative rounded-2xl p-[1px]',
        'bg-gradient-to-b from-white/65 via-white/10 to-white/0 dark:from-white/15 dark:via-white/5 dark:to-transparent',
        'shadow-[0_4px_20px_rgba(15,23,42,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]',
        'transition-[box-shadow,transform,border-color] duration-300 ease-[var(--ease-smooth)]',
        !prefersReducedMotion && [
          'hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(15,23,42,0.14)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]',
          'hover:shadow-[0_0_0_1px_hsl(var(--accent)/0.25),0_12px_40px_rgba(15,23,42,0.14)]',
          'dark:hover:shadow-[0_0_0_1px_hsl(var(--accent)/0.35),0_12px_40px_rgba(0,0,0,0.4)]',
        ],
        className
      )}
    >
      <meta itemProp="name" content={title} />
      <meta itemProp="image" content={image} />
      {product.brand ? <meta itemProp="brand" content={product.brand} /> : null}
      {product.sku ? <meta itemProp="sku" content={product.sku} /> : null}

      <div
        className={cn(
          'relative overflow-hidden rounded-[15px]',
          'border border-[hsl(var(--border))]/80 dark:border-white/10',
          'bg-[hsl(var(--surface))]/98 dark:bg-[hsl(var(--surface))]/92 supports-[backdrop-filter]:backdrop-blur-2xl',
          'transition-[box-shadow,border-color] duration-300 ease-[var(--ease-smooth)]',
          'group-hover:border-[hsl(var(--accent)/0.4)] dark:group-hover:border-[hsl(var(--accent)/0.5)]'
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
          {/* Larger product image with zoom on hover */}
          <div className="card-shine relative aspect-[4/3] w-full overflow-hidden rounded-t-[14px] bg-[hsl(var(--surface-2))] sm:aspect-[1/1]">
            <div className="absolute inset-0">
              <Image
                src={image}
                alt={title}
                fill
                sizes="(min-width:1280px) 22vw, (min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                className={cn(
                  'object-cover transition-transform duration-400 ease-[var(--ease-smooth)]',
                  !prefersReducedMotion && 'group-hover:scale-105',
                  secondImage && 'transition-opacity duration-300 group-hover:opacity-0'
                )}
                priority={priority}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                quality={88}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                draggable={false}
              />
              {secondImage ? (
                <Image
                  src={secondImage}
                  alt=""
                  fill
                  sizes="(min-width:1280px) 22vw, (min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                  className={cn(
                    'absolute inset-0 object-cover opacity-0 transition-[opacity,transform] duration-400 ease-[var(--ease-smooth)] group-hover:opacity-100',
                    !prefersReducedMotion && 'group-hover:scale-105'
                  )}
                  aria-hidden
                  draggable={false}
                />
              ) : null}

              {!imgLoaded && (
                <div
                  className="absolute inset-0 animate-pulse bg-gradient-to-br from-[hsl(var(--surface-2))] to-[hsl(var(--surface))]"
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Badges: En stock, Promo, Livraison offerte — consistent premium style */}
            <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-2 sm:left-4 sm:top-4">
              {product.isNew ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-950 shadow-md ring-1 ring-emerald-900/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-900/90" />
                  {t.new}
                </span>
              ) : null}

              {product.isBestSeller ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-300/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-950 shadow-md ring-1 ring-amber-900/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-700" />
                  {t.best}
                </span>
              ) : null}

              {discountPct ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-50 shadow-md ring-1 ring-red-900/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-200" />
                  {t.sale} -{discountPct}%
                </span>
              ) : null}

              {lowStock ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-200/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-950 shadow-md ring-1 ring-amber-800/30 dark:bg-amber-400/90 dark:text-amber-950">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-700" />
                  {t.lowStock}
                </span>
              ) : null}
            </div>

            {/* Rating overlay when available */}
            {(ratingValue > 0 || reviewsCount > 0) ? (
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/50 px-2.5 py-1.5 text-[11px] shadow-lg backdrop-blur-xl sm:right-4 sm:top-4">
                <RatingStars value={ratingValue} size="xs" editable={false} filledClassName="text-amber-400" emptyClassName="text-white/40" />
                <span className="font-semibold tabular-nums text-white">{ratingValue > 0 ? ratingValue.toFixed(1) : '—'}</span>
                {reviewsCount > 0 ? <span className="text-white/80">({reviewsCount})</span> : null}
              </div>
            ) : null}

            {outOfStock ? (
              <div className="absolute inset-0 grid place-items-center bg-black/55 text-xs font-semibold uppercase tracking-wider text-white/90">
                {t.outOfStock}
              </div>
            ) : null}

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 via-black/10 to-transparent"
              aria-hidden="true"
            />
          </div>

          <div className="flex flex-col px-5 pt-5 pb-5 sm:px-6 sm:pt-6 sm:pb-6">
            {/* Title — max 2 lines, clear hierarchy */}
            <h3
              className="line-clamp-2 min-h-[2.75em] break-words text-base font-bold leading-snug tracking-tight text-[hsl(var(--text))] sm:text-[17px] [letter-spacing:var(--heading-tracking)]"
              title={title}
            >
              {title}
            </h3>

            {product.brand || product.category ? (
              <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[hsl(var(--text))]/50">
                {[product.brand, product.category].filter(Boolean).join(' · ')}
              </p>
            ) : null}

            {/* Price — prominent and clear */}
            <div
              className="mt-4 flex flex-wrap items-baseline gap-2.5"
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
              <span className="text-xl font-extrabold tabular-nums tracking-tight text-[hsl(var(--text))] sm:text-2xl">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && typeof oldPrice === 'number' ? (
                <>
                  <span className="text-sm font-medium text-[hsl(var(--text))]/50 line-through">
                    {formatPrice(oldPrice)}
                  </span>
                  <span className="inline-flex items-center rounded-lg bg-[hsl(var(--accent)/0.14)] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--accent))]">
                    {t.save} {formatPrice(oldPrice - product.price)}
                  </span>
                </>
              ) : null}
            </div>

            {/* Rating (below title) + badges: En stock, Livraison offerte */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              {(ratingValue > 0 || reviewsCount > 0) ? (
                <span className="flex items-center gap-1.5 text-[12px] text-[hsl(var(--text))]/70">
                  <RatingStars value={ratingValue} size="xs" editable={false} filledClassName="text-amber-500" emptyClassName="text-[hsl(var(--border))]" />
                  <span className="font-semibold tabular-nums text-[hsl(var(--text))]/80">{ratingValue > 0 ? ratingValue.toFixed(1) : '—'}</span>
                  {reviewsCount > 0 ? <span className="text-[hsl(var(--text))]/60">({reviewsCount})</span> : null}
                </span>
              ) : null}
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium shadow-sm',
                  outOfStock
                    ? 'bg-red-100/90 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                    : lowStock
                      ? 'bg-amber-100/90 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                      : 'bg-emerald-100/90 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                )}
              >
                <span className="h-1 w-1 shrink-0 rounded-full bg-current/80" />
                {outOfStock ? t.outOfStock : lowStock ? t.lowStock : t.inStock}
              </span>
              <FreeShippingBadge price={product.price} minimal />
            </div>

            {/* CTA — full width, icon + label, stronger hover */}
            <div className="mt-5 border-t border-[hsl(var(--border))]/50 pt-5">
              <AddToCartButton
                product={{ _id: product._id, slug: product.slug, title, image, price: product.price }}
                stopPropagation
                size="sm"
                variant="outline"
                fullWidth
                withIcon
                idleText={t.addToCart}
                className={cn(
                  'min-h-[3rem] w-full rounded-xl border-2 border-[hsl(var(--accent))] font-semibold text-[hsl(var(--accent))]',
                  'transition-all duration-200 ease-[var(--ease-smooth)]',
                  'hover:scale-[1.02] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] hover:shadow-md hover:shadow-[hsl(var(--accent)/0.3)]',
                  'focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.5)]'
                )}
                ariaLabel={`${t.addToCart} — ${title}`}
              />
            </div>
          </div>
        </Link>
      </div>
    </motion.article>
  )
}

export default memo(ProductCard)
