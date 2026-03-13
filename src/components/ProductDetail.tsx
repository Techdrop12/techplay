'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEventHandler,
  type PointerEventHandler,
} from 'react'
import { toast } from 'react-hot-toast'
import { FaCcMastercard, FaCcPaypal, FaCcVisa } from 'react-icons/fa'

import type { AggregateRating, Product, Review } from '@/types/product'

import AddToCartButtonAB from '@/components/AddToCartButtonAB'
import FreeShippingBadge from '@/components/FreeShippingBadge'
import PricingBadge from '@/components/PricingBadge'
import ProductReviews from '@/components/Product/ProductReviews'
import ProductTags from '@/components/ProductTags'
import QuantitySelector from '@/components/QuantitySelector'
import RatingStars from '@/components/RatingStars'
import RatingSummary from '@/components/RatingSummary'
import ReviewForm from '@/components/ReviewForm'
import ShippingSimulator from '@/components/ShippingSimulator'
import DeliveryEstimate from '@/components/ui/DeliveryEstimate'
import WishlistButton from '@/components/WishlistButton'
import { detectCurrency } from '@/lib/currency'
import {
  mapProductToGaItem,
  trackAddToCart,
  trackAddToWishlist,
  trackSelectItem,
  trackViewItem,
} from '@/lib/ga'
import { DEFAULT_LOCALE, isLocale, type AppLocale } from '@/lib/language'
import { logEvent } from '@/lib/logEvent'
import { pixelViewContent } from '@/lib/meta-pixel'
import { safeProductImageUrl } from '@/lib/safeProductImage'
import { cn, formatPrice } from '@/lib/utils'

interface Props {
  product: Product
  locale?: string
}

type RecentProduct = {
  _id: string
  slug: string
  title: string
  price: number
  image: string
}

type ProductLike = Product & Record<string, unknown>

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYikiIGZpbGw9IiNlZWUiIC8+PC9zdmc+'

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

function toNum(value: unknown): number | undefined {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : NaN

  return Number.isFinite(parsed) ? parsed : undefined
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function buildGallery(product: ProductLike): string[] {
  const pool = [
    product.image,
    ...(Array.isArray(product.images) ? product.images : []),
    ...(Array.isArray(product.gallery) ? product.gallery : []),
  ]

  const urls = Array.from(
    new Set(pool.filter((item): item is string => typeof item === 'string' && item.trim().length > 0))
  ).slice(0, 8)
  return urls.map((url) => safeProductImageUrl(url))
}

function computeAggregate(
  ratingFromProduct: number | undefined,
  reviews: Review[] | undefined,
  aggregate?: AggregateRating
): AggregateRating {
  if (aggregate?.total && typeof aggregate.average === 'number') {
    return aggregate
  }

  const list = Array.isArray(reviews) ? reviews : []
  const total = list.length

  if (total > 0) {
    const breakdown: Partial<Record<1 | 2 | 3 | 4 | 5, number>> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }

    let sum = 0
    let counted = 0

    for (const review of list) {
      const value = toNum(review?.rating)
      if (value && value >= 1 && value <= 5) {
        const safeRating = value as 1 | 2 | 3 | 4 | 5
        breakdown[safeRating] = (breakdown[safeRating] || 0) + 1
        sum += safeRating
        counted += 1
      }
    }

    return {
      average: counted ? Math.max(0, Math.min(5, sum / counted)) : ratingFromProduct ?? 0,
      total,
      breakdownCount: breakdown,
    }
  }

  return {
    average:
      typeof ratingFromProduct === 'number' ? Math.max(0, Math.min(5, ratingFromProduct)) : 0,
    total: aggregate?.total ?? 0,
    breakdownCount: aggregate?.breakdownCount,
  }
}

function toGaSource(product: Product): Record<string, unknown> {
  return product as Record<string, unknown>
}

function IconShare({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M14 3l7 7-7 7v-4h-1.5A7.5 7.5 0 0 1 5 5.5V4a1 1 0 0 1 1-1h1.5A7.5 7.5 0 0 0 12.5 10H14V3zM6 20h12v2H6z"
      />
    </svg>
  )
}

export default function ProductDetail({ product, locale = 'fr' }: Props) {
  const prefersReducedMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement | null>(null)
  const mediaRef = useRef<HTMLDivElement | null>(null)
  const viewedRef = useRef(false)

  const safeLocale: AppLocale = isLocale(locale) ? locale : DEFAULT_LOCALE
  const currency = detectCurrency(safeLocale === 'en' ? 'en' : undefined)

  const t =
    safeLocale === 'en'
      ? {
          newLabel: 'New',
          bestSeller: 'Best seller',
          reviews: 'reviews',
          stock: 'In stock',
          lowStock: 'Only',
          lowStockSuffix: 'left in stock',
          outOfStock: 'Out of stock',
          hurry: 'Hurry up, almost sold out',
          quantity: 'Quantity',
          quantityHelp: 'Choose the quantity to add to cart',
          unavailable: 'Currently unavailable',
          notifyMe: 'Notify me',
          share: 'Share',
          copied: 'Link copied to clipboard',
          imageLabel: 'Image',
          of: 'of',
          imageHelp: 'Click or press Enter/Space to zoom the image.',
          imageHelpOut: 'Click or press Enter/Space to zoom out the image.',
          payments: 'Payments:',
          returns: '2-year warranty & 30-day returns',
          secured: '100% secure payment',
          shipping: 'Ships within 24 business hours',
          deliveryReturns: 'Delivery & returns',
          specs: 'Specifications',
          detailedSpecs: 'Detailed specifications available on the product sheet.',
          brand: 'Brand',
          acceptedPayments: 'Accepted payments: Visa, Mastercard, PayPal',
          addToCart: 'Add to cart',
          notifyToast: 'We can notify you when it comes back.',
          galleryLabel: 'Product gallery thumbnails',
          save: 'Save',
        }
      : {
          newLabel: 'Nouveau',
          bestSeller: 'Best Seller',
          reviews: 'avis',
          stock: 'En stock',
          lowStock: 'Plus que',
          lowStockSuffix: 'en stock',
          outOfStock: 'Rupture',
          hurry: 'Dépêchez-vous, bientôt épuisé',
          quantity: 'Quantité',
          quantityHelp: 'Sélectionnez la quantité à ajouter au panier',
          unavailable: 'Indisponible actuellement',
          notifyMe: 'Me prévenir',
          share: 'Partager',
          copied: 'Lien copié dans le presse-papier',
          imageLabel: 'Image',
          of: 'sur',
          imageHelp: 'Cliquer ou appuyer sur Entrée/Espace pour zoomer l’image.',
          imageHelpOut: 'Cliquer ou appuyer sur Entrée/Espace pour dézoomer l’image.',
          payments: 'Paiements :',
          returns: 'Garantie 2 ans & retours sous 30 jours',
          secured: 'Paiement 100% sécurisé',
          shipping: 'Expédition en 24h ouvrées',
          deliveryReturns: 'Livraison & retours',
          specs: 'Spécifications',
          detailedSpecs: 'Caractéristiques détaillées disponibles sur la fiche.',
          brand: 'Marque',
          acceptedPayments: 'Paiements acceptés : Visa, Mastercard, PayPal',
          addToCart: 'Ajouter au panier',
          notifyToast: '🔔 Nous pouvons vous prévenir quand il revient.',
          galleryLabel: 'Miniatures du produit',
          save: 'Économisez',
        }

  const source = product as ProductLike

  const _id = String(product._id || '')
  const slug = readString(product.slug) || ''
  const title = readString(product.title) || 'Produit'
  const description = readString(product.description) || ''
  const brand = readString(product.brand)
  const category = readString(product.category)
  const sku = readString(source.sku)
  const image = safeProductImageUrl(readString(product.image)) || '/og-image.jpg'
  const price = Math.max(0, toNum(product.price) ?? 0)
  const oldPrice = toNum(product.oldPrice)
  const rating = toNum(product.rating)
  const reviews = Array.isArray(product.reviews) ? product.reviews : []
  const reviewsCount = toNum(product.reviewsCount)
  const isNew = Boolean(product.isNew)
  const isBestSeller = Boolean(product.isBestSeller)
  const stock = toNum(product.stock)
  const tags = Array.isArray(source.tags)
    ? source.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
    : []

  const gallery = useMemo(() => buildGallery(source), [source])
  const safeGallery = gallery.length > 0 ? gallery : [image]

  const [quantity, setQuantity] = useState(1)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })

  const activeImage = safeGallery[activeIdx] || image
  const total = useMemo(() => price * quantity, [price, quantity])

  const aggregate = useMemo(
    () => computeAggregate(rating, reviews, product.aggregateRating),
    [rating, reviews, product.aggregateRating]
  )

  const totalReviews = aggregate.total || reviewsCount || 0
  const discount =
    typeof oldPrice === 'number' && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null

  const amountSaved =
    typeof oldPrice === 'number' && oldPrice > price ? oldPrice - price : null

  const availability =
    typeof stock === 'number'
      ? stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock'
      : 'https://schema.org/InStock'

  const lowStock = typeof stock === 'number' && stock > 0 && stock <= 5
  const outOfStock = typeof stock === 'number' && stock <= 0
  const priceStr = price.toFixed(2)

  useEffect(() => {
    if (!sectionRef.current || viewedRef.current) return

    const el = sectionRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting)
        if (!visible || viewedRef.current) return

        viewedRef.current = true

        try {
          logEvent({
            action: 'product_detail_view',
            category: 'engagement',
            label: title,
            value: price,
          })
        } catch {
          // no-op
        }

        try {
          trackViewItem({
            currency,
            value: price,
            items: [{ ...mapProductToGaItem(toGaSource(product)), quantity: 1 }],
          })
        } catch {
          // no-op
        }

        try {
          pixelViewContent({
            value: price,
            currency,
            content_name: title,
            content_type: 'product',
            content_ids: [String(product._id ?? product.slug ?? '')].filter(Boolean),
            contents: [
              {
                id: String(product._id ?? product.slug ?? ''),
                quantity: 1,
                item_price: price,
              },
            ],
          })
        } catch {
          // no-op
        }

        try {
          const key = 'recent:products'
          const prev = JSON.parse(localStorage.getItem(key) || '[]') as RecentProduct[]
          const next = [
            { _id, slug, title, price, image: safeGallery[0] ?? image },
            ...prev.filter((item) => item._id !== _id),
          ].slice(0, 16)
          localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // no-op
        }
      },
      { threshold: 0.35 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [_id, currency, image, price, product, safeGallery, slug, title])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      const editable = tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable

      if (editable) return

      if (event.key === '+') setQuantity((q) => clamp(q + 1, 1, 99))
      if (event.key === '-') setQuantity((q) => clamp(q - 1, 1, 99))
      if (event.key === 'ArrowLeft') setActiveIdx((i) => Math.max(0, i - 1))
      if (event.key === 'ArrowRight') setActiveIdx((i) => Math.min(safeGallery.length - 1, i + 1))
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [safeGallery.length])

  useEffect(() => {
    if (typeof window === 'undefined' || safeGallery.length <= 1) return

    const nextIndex = (activeIdx + 1) % safeGallery.length
    const prevIndex = (activeIdx - 1 + safeGallery.length) % safeGallery.length

    for (const src of [safeGallery[nextIndex], safeGallery[prevIndex]]) {
      if (!src) continue
      const img = new window.Image()
      img.src = src
    }
  }, [activeIdx, safeGallery])

  const onAddToCart = useCallback(() => {
    try {
      logEvent({
        action: 'add_to_cart',
        category: 'ecommerce',
        label: title,
        value: total,
      })
    } catch {
      // no-op
    }

    try {
      trackAddToCart({
        currency,
        value: total,
        items: [{ ...mapProductToGaItem(toGaSource(product)), quantity }],
      })
    } catch {
      // no-op
    }
  }, [currency, product, quantity, title, total])

  const onAddWishlist = useCallback(() => {
    try {
      logEvent({
        action: 'add_to_wishlist',
        category: 'ecommerce',
        label: title,
        value: price,
      })
    } catch {
      // no-op
    }

    try {
      trackAddToWishlist({
        currency,
        value: price,
        items: [{ ...mapProductToGaItem(toGaSource(product)), quantity: 1 }],
      })
    } catch {
      // no-op
    }
  }, [currency, price, product, title])

  const onThumbSelect = (idx: number) => {
    setActiveIdx(idx)

    try {
      trackSelectItem({
        currency,
        value: price,
        items: [{ ...mapProductToGaItem(toGaSource(product)), quantity: 1 }],
        item_list_name: 'product_gallery',
      })
    } catch {
      // no-op
    }
  }

  const share = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : ''

      if (
        typeof navigator !== 'undefined' &&
        'share' in navigator &&
        typeof navigator.share === 'function'
      ) {
        await navigator.share({ title, text: title, url })
        return
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        toast.success(t.copied)
      }
    } catch {
      // no-op
    }
  }

  const onPointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!mediaRef.current || !zoomed) return

    const rect = mediaRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    setOrigin({
      x: clamp(x, 0, 100),
      y: clamp(y, 0, 100),
    })
  }

  const toggleZoom = () => {
    if (prefersReducedMotion) return
    setZoomed((value) => !value)
  }

  const onMediaKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleZoom()
    }

    if (event.key === 'ArrowLeft') {
      setActiveIdx((i) => Math.max(0, i - 1))
    }

    if (event.key === 'ArrowRight') {
      setActiveIdx((i) => Math.min(safeGallery.length - 1, i + 1))
    }
  }

  return (
    <motion.section
      ref={sectionRef}
      className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-12 lg:grid-cols-2"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      aria-labelledby="product-title"
      data-product-id={_id || slug}
      data-product-slug={slug}
      role="region"
      aria-live="polite"
      itemScope
      itemType="https://schema.org/Product"
    >
      <div className="grid gap-4">
        <div
          ref={mediaRef}
          className={cn(
            'relative aspect-square w-full overflow-hidden rounded-3xl border shadow-xl',
            'border-token-border bg-token-surface'
          )}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setZoomed(false)}
          onClick={toggleZoom}
          onKeyDown={onMediaKeyDown}
          role="button"
          aria-label={`${t.imageLabel} ${activeIdx + 1} ${t.of} ${safeGallery.length} : ${title}`}
          aria-busy={!imgLoaded}
          tabIndex={0}
        >
          <Image
            key={activeImage}
            src={activeImage}
            alt={`${t.imageLabel} ${activeIdx + 1} ${t.of} ${safeGallery.length} - ${title}`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className={cn(
              'object-cover transition-transform duration-700 will-change-transform',
              zoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in hover:scale-[1.03]'
            )}
            style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
            onLoad={() => setImgLoaded(true)}
            itemProp="image"
            draggable={false}
          />

          {!imgLoaded && (
            <div
              className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200/70 to-gray-100/40 dark:from-zinc-800/60 dark:to-zinc-900/40"
              aria-hidden="true"
            />
          )}

          <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col gap-2">
            {isNew ? (
              <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-semibold text-white shadow-md">
                {t.newLabel}
              </span>
            ) : null}

            {isBestSeller ? (
              <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-semibold text-black shadow-md">
                {t.bestSeller}
              </span>
            ) : null}

            {discount ? (
              <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white shadow-md">
                -{discount}%
              </span>
            ) : null}
          </div>

          <div className="absolute bottom-4 right-4 z-10">
            <PricingBadge price={price} oldPrice={oldPrice} showDiscountLabel showOldPrice />
          </div>

          <div className="absolute right-4 top-4 z-10 flex gap-2">
            <button
              type="button"
              onClick={share}
              className="rounded-full border border-token-border bg-white/90 px-3 py-2 text-sm shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] dark:bg-black/60"
              aria-label={t.share}
              title={t.share}
            >
              <IconShare />
            </button>
          </div>

          <p className="sr-only">{zoomed ? t.imageHelpOut : t.imageHelp}</p>
        </div>

        {safeGallery.length > 1 ? (
          <nav aria-label={t.galleryLabel}>
            <ul role="list" className="grid grid-cols-5 gap-3 sm:grid-cols-6">
              {safeGallery.map((src, idx) => {
                const active = idx === activeIdx

                return (
                  <li key={`${src}-${idx}`}>
                    <button
                      type="button"
                      onClick={() => onThumbSelect(idx)}
                      onMouseEnter={() => !prefersReducedMotion && setActiveIdx(idx)}
                      className={cn(
                        'relative block aspect-square overflow-hidden rounded-xl border transition',
                        active
                          ? 'border-[hsl(var(--accent))] ring-2 ring-[hsl(var(--accent))]'
                          : 'border-token-border hover:border-[hsl(var(--accent)/.6)]'
                      )}
                      aria-label={`${t.imageLabel} ${idx + 1}`}
                      aria-current={active ? 'true' : undefined}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        ) : null}
      </div>

      <div className="flex flex-col justify-between space-y-8">
        <div>
          <h1
            id="product-title"
            className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white"
            tabIndex={-1}
            itemProp="name"
          >
            {title}
          </h1>

          {_id || sku ? <meta itemProp="sku" content={String(_id || sku)} /> : null}
          {brand ? <meta itemProp="brand" content={brand} /> : null}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RatingStars value={aggregate.average || 0} editable={false} />

            {totalReviews > 0 ? (
              <a
                href="#reviews"
                className="text-sm text-[hsl(var(--accent))] underline underline-offset-2"
                onClick={() => {
                  try {
                    logEvent({
                      action: 'jump_to_reviews',
                      category: 'engagement',
                      label: slug || title,
                    })
                  } catch {
                    // no-op
                  }
                }}
              >
                {totalReviews} {t.reviews}
              </a>
            ) : null}

            <FreeShippingBadge price={price} minimal />

            {typeof stock === 'number' ? (
              <span
                className={cn(
                  'rounded-full border px-2 py-1 text-xs',
                  stock > 0
                    ? lowStock
                      ? 'border-amber-300 text-amber-700 dark:text-amber-300'
                      : 'border-emerald-300 text-emerald-700 dark:text-emerald-300'
                    : 'border-red-300 text-red-600 dark:text-red-400'
                )}
                aria-live="polite"
              >
                {stock > 0
                  ? lowStock
                    ? `${t.lowStock} ${stock} ${t.lowStockSuffix}`
                    : t.stock
                  : t.outOfStock}
              </span>
            ) : null}
          </div>

          {lowStock ? (
            <div className="mt-2">
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/30"
                aria-hidden="true"
              >
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${Math.min(100, ((stock || 0) / 5) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{t.hurry}</p>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-end gap-3" aria-live="polite">
            <span
              className="text-3xl font-extrabold text-brand"
              aria-label={`Prix : ${formatPrice(price, { currency })}`}
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <meta itemProp="priceCurrency" content={currency} />
              <meta itemProp="price" content={priceStr} />
              <meta itemProp="availability" content={availability} />
              {formatPrice(price, { currency })}
            </span>

            {typeof oldPrice === 'number' && oldPrice > price ? (
              <span className="line-through text-gray-400 dark:text-gray-500">
                {formatPrice(oldPrice, { currency })}
              </span>
            ) : null}

            {discount && amountSaved ? (
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {t.save} {formatPrice(amountSaved, { currency })} ({discount}%)
              </span>
            ) : null}

            {quantity > 1 ? (
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Total ({quantity}×)&nbsp;:{' '}
                <span className="font-semibold">{formatPrice(total, { currency })}</span>
              </span>
            ) : null}
          </div>

          <div className="mt-3">
            <DeliveryEstimate />
          </div>

          {description ? (
            <p
              className="mt-6 whitespace-pre-line text-lg leading-relaxed text-gray-700 dark:text-gray-300"
              itemProp="description"
            >
              {description}
            </p>
          ) : null}

          {tags.length > 0 ? (
            <div className="mt-4">
              <ProductTags tags={tags} />
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span aria-hidden="true">✅</span> {t.returns}
            </div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true">🔒</span> {t.secured}
            </div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true">⚡</span> {t.shipping}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label htmlFor="quantity" className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.quantity} :
            </label>

            <QuantitySelector
              value={quantity}
              onChange={(q) => setQuantity(clamp(q, 1, 99))}
              id="quantity"
              aria-describedby="quantity-desc"
            />
          </div>

          <p id="quantity-desc" className="sr-only">
            {t.quantityHelp}
          </p>

          {!outOfStock ? (
            <AddToCartButtonAB
              product={{
                _id,
                slug,
                title,
                price,
                image: safeGallery[0] ?? image,
                quantity,
              }}
              locale={safeLocale}
              onAdd={onAddToCart}
              gtmExtra={{
                from: 'pdp',
                product_id: _id,
                product_slug: slug,
                product_title: title,
                product_price: price,
                product_category: category ?? undefined,
              }}
              size="lg"
              aria-label={`${t.addToCart} ${title}`}
            />
          ) : (
            <div
              className="inline-flex items-center justify-center rounded-lg border border-red-300 px-4 py-3 text-red-700 dark:text-red-300"
              role="alert"
            >
              {t.unavailable}
              <button
                type="button"
                onClick={() => toast(t.notifyToast)}
                className="ml-3 underline underline-offset-2"
              >
                {t.notifyMe}
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-block" onClick={onAddWishlist}>
              <WishlistButton
                product={{
                  _id,
                  slug,
                  title,
                  price,
                  image: safeGallery[0] ?? image,
                }}
                floating={false}
                className="mt-2"
              />
            </div>

            <button
              type="button"
              onClick={share}
              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] dark:border-gray-700 dark:hover:bg-zinc-800"
              aria-label={t.share}
              title={t.share}
            >
              <IconShare />
              <span>{t.share}</span>
            </button>

            <div className="ml-auto mt-2 flex items-center gap-3 text-2xl text-token-text/60">
              <span className="mr-1 text-xs font-medium">{t.payments}</span>
              <FaCcVisa aria-hidden="true" title="Visa" className="transition-opacity hover:opacity-90" />
              <FaCcMastercard aria-hidden="true" title="Mastercard" className="transition-opacity hover:opacity-90" />
              <FaCcPaypal aria-hidden="true" title="PayPal" className="transition-opacity hover:opacity-90" />
              <span className="sr-only">{t.acceptedPayments}</span>
            </div>
          </div>

          <div className="mt-2">
            <ShippingSimulator minDays={2} maxDays={3} businessDaysOnly />
          </div>

          <div className="mt-2 grid gap-2">
            <details className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <summary className="cursor-pointer font-semibold">{t.deliveryReturns}</summary>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  {safeLocale === 'en'
                    ? 'Delivery within 48–72h in mainland France'
                    : 'Livraison 48–72h en France métropolitaine'}
                </li>
                <li>
                  {safeLocale === 'en'
                    ? 'Free return within 30 days'
                    : 'Retour gratuit sous 30 jours'}
                </li>
                <li>
                  {safeLocale === 'en' ? 'Real-time order tracking' : 'Suivi colis temps réel'}
                </li>
              </ul>
            </details>

            <details className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <summary className="cursor-pointer font-semibold">{t.specs}</summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {brand ? (
                  <>
                    {t.brand}&nbsp;: <strong>{brand}</strong>
                  </>
                ) : (
                  t.detailedSpecs
                )}
              </p>
            </details>
          </div>
        </div>
      </div>

      <div className="mt-12 lg:col-span-2" id="reviews" aria-label="Avis clients">
        <div className="mb-6">
          <RatingSummary
            average={aggregate.average}
            total={totalReviews}
            breakdownCount={aggregate.breakdownCount}
            jsonLd={{ productSku: _id, productName: title }}
          />
        </div>

        {reviews.length > 0 ? (
          <div className="mb-10">
            <ProductReviews reviews={reviews} />
          </div>
        ) : null}

        <ReviewForm productId={_id} />
      </div>
    </motion.section>
  )
}