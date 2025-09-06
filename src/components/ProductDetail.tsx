// src/components/ProductDetail.tsx — OPTI MAX (SEO/a11y/UX/Perf) — CENTRAL JSON-LD GÉRÉ EN PAGE — FINAL
'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { formatPrice, cn } from '@/lib/utils'
import WishlistButton from '@/components/WishlistButton'
import FreeShippingBadge from '@/components/FreeShippingBadge'
import QuantitySelector from '@/components/QuantitySelector'
import RatingStars from '@/components/RatingStars'
import PricingBadge from '@/components/PricingBadge'
import AddToCartButtonAB from '@/components/AddToCartButtonAB'
import ReviewForm from '@/components/ReviewForm'
import StickyCartSummary from '@/components/StickyCartSummary'
import ProductTags from '@/components/ProductTags'
import DeliveryEstimate from '@/components/ui/DeliveryEstimate'
import ShippingSimulator from '@/components/ShippingSimulator'
import RatingSummary from '@/components/RatingSummary'
import ProductReviews from '@/components/Product/ProductReviews'
import type { Product, Review, AggregateRating } from '@/types/product'
import { toast } from 'react-hot-toast'
import { logEvent } from '@/lib/logEvent'
import {
  trackViewItem,
  trackAddToCart,
  trackAddToWishlist,
  trackSelectItem,
  mapProductToGaItem,
} from '@/lib/ga'
import { pixelViewContent } from '@/lib/meta-pixel'
import { DEFAULT_LOCALE, isLocale, type AppLocale } from '@/lib/language'
import { FaCcVisa, FaCcMastercard, FaCcPaypal } from 'react-icons/fa'

interface Props {
  product: Product
  /** string tolérée ici, on normalise juste avant usage */
  locale?: string
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

// très petit blur inline (évite un asset supplémentaire)
const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYikiIGZpbGw9IiNlZWUiIC8+PC9zdmc+'

/** Icône “share” (inline, pas d’emoji) */
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

/** Cast “safe number” (accepte string/number) */
const toNum = (v: unknown): number | undefined => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : undefined
}

/** Détection devise simple (EUR/GBP/USD) */
function detectCurrency(): 'EUR' | 'GBP' | 'USD' {
  try {
    const htmlLang = typeof document !== 'undefined' ? document.documentElement.lang || '' : ''
    const nav = typeof navigator !== 'undefined' ? navigator.language || '' : ''
    const src = (htmlLang || nav).toLowerCase()
    if (src.includes('gb') || src.endsWith('-uk') || src.includes('en-gb')) return 'GBP'
    if (src.includes('us') || src.includes('en-us')) return 'USD'
    if (src.startsWith('en')) return 'USD'
    return 'EUR'
  } catch {
    return 'EUR'
  }
}

/** Agrégat reviews robuste (fallback si l’API ne fournit pas aggregateRating) */
function computeAggregate(
  ratingFromProduct: number | undefined,
  reviews: Review[] | undefined,
  aggregate?: AggregateRating,
): AggregateRating {
  if (aggregate?.total && aggregate.average) return aggregate
  const list = Array.isArray(reviews) ? reviews : []
  const total = list.length
  if (total > 0) {
    const counts: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let sum = 0
    for (const r of list) {
      const v = (r?.rating as 1 | 2 | 3 | 4 | 5) ?? 0
      if (v >= 1 && v <= 5) {
        counts[v]++
        sum += v
      }
    }
    return {
      average: total ? Math.max(0, Math.min(5, sum / total)) : ratingFromProduct ?? 0,
      total,
      breakdownCount: counts,
    }
  }
  return {
    average: typeof ratingFromProduct === 'number' ? Math.max(0, Math.min(5, ratingFromProduct)) : 0,
    total: (aggregate?.total as number) ?? 0,
    breakdownCount: aggregate?.breakdownCount,
  }
}

export default function ProductDetail({ product, locale = 'fr' }: Props) {
  const prefersReducedMotion = useReducedMotion()

  const [quantity, setQuantity] = useState<number>(1)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const viewedRef = useRef(false)
  const sectionRef = useRef<HTMLElement | null>(null)

  // zoom/tilt image
  const mediaRef = useRef<HTMLDivElement | null>(null)
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 })

  // Unpack produit — ⚠️ on ne sort PAS `tags` ici (voir plus bas)
  const {
    _id,
    slug = '',
    title = 'Produit',
    price: priceRaw = 0,
    oldPrice: oldPriceRaw,
    image = '/og-image.jpg',
    images,
    description = '',
    rating,
    isNew,
    isBestSeller,
    stock,
    brand,
    category,
    reviews,
    aggregateRating,
    reviewsCount,
  } = product ?? {}

  // ✅ Normalisation des prix (tolère string)
  const price = Math.max(0, toNum(priceRaw) ?? 0)
  const oldPrice = toNum(oldPriceRaw)
  const currency: 'EUR' = 'EUR'

  // ✅ Extraction tolérante de `tags`
  const tags: string[] | undefined =
    (product as Partial<Product> & { tags?: string[] }).tags

  // Galerie (images[] -> max 8)
  const gallery: string[] = useMemo(() => {
    const arr = Array.isArray(images) && images.length ? images : [image].filter(Boolean)
    return Array.from(new Set(arr)).slice(0, 8)
  }, [images, image])

  const hasRating = typeof rating === 'number' && !Number.isNaN(rating)
  const discount =
    typeof oldPrice === 'number' && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null

  const priceStr = useMemo(() => price.toFixed(2), [price])
  const availability =
    typeof stock === 'number'
      ? stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock'
      : 'https://schema.org/InStock'
  const lowStock = typeof stock === 'number' && stock > 0 && stock <= 5
  const total = useMemo(() => price * quantity, [price, quantity])

  // Agrégat reviews sécurisé
  const agg = useMemo(
    () => computeAggregate(rating, reviews as any, aggregateRating),
    [rating, reviews, aggregateRating],
  )
  const totalReviews = agg.total || reviewsCount || 0

  /* ------------------------------------------------------------------------ */
  /*                           Tracking / Recently viewed                     */
  /* ------------------------------------------------------------------------ */

  // GA4 + Pixel “ViewContent” quand la section devient visible (une seule fois)
  useEffect(() => {
    if (!sectionRef.current || viewedRef.current) return
    const el = sectionRef.current
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !viewedRef.current) {
          viewedRef.current = true
          try {
            logEvent({ action: 'product_detail_view', category: 'engagement', label: title, value: price })
          } catch {}
          try {
            trackViewItem({
              currency,
              value: price,
              items: [mapProductToGaItem(product, { quantity: 1 })],
            })
          } catch {}
          try {
            pixelViewContent({
              value: price,
              currency,
              content_name: title,
              content_type: 'product',
              content_ids: [String(product?._id ?? product?.slug ?? '')].filter(Boolean),
              contents: [{ id: String(product?._id ?? product?.slug ?? ''), quantity: 1, item_price: price }],
            })
          } catch {}
          // Ajout "vu récemment" (tolérant)
          try {
            const key = 'recent:products'
            const prev = JSON.parse(localStorage.getItem(key) || '[]') as any[]
            const next = [{ _id, slug, title, price, image: gallery[0] ?? image }, ...prev.filter(p => p?._id !== _id)].slice(0, 16)
            localStorage.setItem(key, JSON.stringify(next))
          } catch {}
        }
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [product, title, price, _id, image, gallery, currency])

  // Raccourcis clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      const editable = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable
      if (editable) return
      if (e.key === '+') setQuantity((q) => clamp(q + 1, 1, 99))
      if (e.key === '-') setQuantity((q) => clamp(q - 1, 1, 99))
      if (e.key.toLowerCase() === 'a') { e.preventDefault(); onAddToCart() }
      if (e.key.toLowerCase() === 'w') { e.preventDefault(); onAddWishlist() }
      if (e.key === 'ArrowLeft') setActiveIdx((i) => (i > 0 ? i - 1 : i))
      if (e.key === 'ArrowRight') setActiveIdx((i) => (i < gallery.length - 1 ? i + 1 : i))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gallery.length])

  // Handlers e-commerce
  const onAddToCart = useCallback(() => {
    try { logEvent({ action: 'add_to_cart', category: 'ecommerce', label: title, value: total }) } catch {}
    try {
      trackAddToCart({
        currency,
        value: total,
        items: [mapProductToGaItem(product, { quantity })],
      })
    } catch {}
  }, [title, total, product, quantity, currency])

  const onAddWishlist = useCallback(() => {
    try { logEvent({ action: 'add_to_wishlist', category: 'ecommerce', label: title, value: price }) } catch {}
    try {
      trackAddToWishlist({
        currency,
        value: price,
        items: [mapProductToGaItem(product, { quantity: 1 })],
      })
    } catch {}
  }, [title, price, product, currency])

  const onThumbSelect = (idx: number) => {
    setActiveIdx(idx)
    try {
      trackSelectItem({
        currency,
        value: price,
        items: [mapProductToGaItem(product, { quantity: 1 })],
        item_list_name: 'product_gallery',
      })
    } catch {}
  }

  // Partage & copie
  const share = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : ''
      if ((navigator as any).share) {
        await (navigator as any).share({ title, text: title, url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        toast.success('Lien copié dans le presse-papier')
      }
    } catch {}
  }

  /* ------------------------------------------------------------------------ */
  /*                              Image interactions                           */
  /* ------------------------------------------------------------------------ */
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!mediaRef.current) return
    if (!zoomed) return
    const rect = mediaRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin({ x: clamp(x, 0, 100), y: clamp(y, 0, 100) })
  }

  const toggleZoom = () => {
    if (prefersReducedMotion) return
    setZoomed((z) => !z)
  }

  const onMediaKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleZoom()
    } else if (e.key === 'ArrowLeft') {
      setActiveIdx((i) => (i > 0 ? i - 1 : i))
    } else if (e.key === 'ArrowRight') {
      setActiveIdx((i) => (i < gallery.length - 1 ? i + 1 : i))
    }
  }

  // Prefetch next/prev images (très léger)
  useEffect(() => {
    if (typeof window === 'undefined' || gallery.length <= 1) return
    const n = (activeIdx + 1) % gallery.length
    const p = (activeIdx - 1 + gallery.length) % gallery.length
    ;[gallery[n], gallery[p]].filter(Boolean).forEach((src) => {
      const img = new window.Image()
      img.src = src!
    })
  }, [activeIdx, gallery])

  // ✅ Normalisation de la locale → AppLocale
  const safeLocale: AppLocale = isLocale(locale) ? (locale as AppLocale) : DEFAULT_LOCALE

  return (
    <motion.section
      ref={sectionRef}
      className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto px-4 py-12"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      aria-labelledby="product-title"
      data-product-id={_id}
      data-product-slug={slug}
      role="region"
      aria-live="polite"
      itemScope
      itemType="https://schema.org/Product"
    >
      {/* Galerie */}
      <div className="grid gap-4">
        <div
          ref={mediaRef}
          className={cn(
            'relative w-full aspect-square rounded-3xl overflow-hidden border',
            'border-gray-200 dark:border-gray-700 shadow-xl bg-gray-50 dark:bg-zinc-900'
          )}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setZoomed(false)}
          onClick={toggleZoom}
          onKeyDown={onMediaKeyDown}
          role="img"
          aria-label={`Image ${activeIdx + 1} sur ${gallery.length} : ${title}`}
          aria-busy={!imgLoaded}
          tabIndex={0}
        >
          <Image
            key={gallery[activeIdx] ?? image}
            src={gallery[activeIdx] ?? image}
            alt={`Image ${activeIdx + 1} de ${title}`}
            fill
            className={cn(
              'object-cover transition-transform duration-700 will-change-transform',
              zoomed ? 'scale-125 cursor-zoom-out' : 'hover:scale-[1.03] cursor-zoom-in'
            )}
            style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            onLoadingComplete={() => setImgLoaded(true)}
            itemProp="image"
            draggable={false}
          />
          {!imgLoaded && (
            <div
              className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200/70 to-gray-100/40 dark:from-zinc-800/60 dark:to-zinc-900/40"
              aria-hidden="true"
            />
          )}

          {/* Badges & pricing overlays */}
          <div className="absolute bottom-4 right-4 z-10">
            <PricingBadge price={price} oldPrice={oldPrice} showDiscountLabel showOldPrice />
          </div>
          <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none select-none z-10">
            {isNew && <span className="bg-green-600 text-white px-3 py-1 rounded-full font-semibold text-sm shadow-md">Nouveau</span>}
            {isBestSeller && <span className="bg-yellow-400 text-black px-3 py-1 rounded-full font-semibold text-sm shadow-md">Best Seller</span>}
            {discount && <span className="bg-red-600 text-white px-3 py-1 rounded-full font-semibold text-sm shadow-md">-{discount}%</span>}
          </div>

          {/* Actions coin droit */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={share}
              className="rounded-full bg-white/90 dark:bg_black/60 dark:bg-black/60 border border-gray-200 dark:border-gray-700 px-3 py-1 text-sm shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Partager ce produit"
              title="Partager"
            >
              <IconShare />
            </button>
          </div>

          <p className="sr-only">Cliquer ou appuyer sur Entrée/Espace pour {zoomed ? 'dézoomer' : 'zoomer'} l’image.</p>
        </div>

        {gallery.length > 1 && (
          <nav aria-label="Miniatures du produit">
            <ul role="list" className="grid grid-cols-5 sm:grid-cols-6 gap-3">
              {gallery.map((src, i) => {
                const active = i === activeIdx
                return (
                  <li key={`${src}-${i}`}>
                    <button
                      onClick={() => onThumbSelect(i)}
                      onMouseEnter={() => !prefersReducedMotion && setActiveIdx(i)}
                      className={cn(
                        'relative block aspect-square rounded-xl overflow-hidden border transition',
                        active
                          ? 'border-accent ring-2 ring-accent'
                          : 'border-gray-200 dark:border-gray-700 hover:border-accent/60'
                      )}
                      aria-label={`Voir l’image ${i + 1}`}
                      aria-current={active ? 'true' : 'false'}
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
        )}
      </div>

      {/* Infos + actions */}
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

          {/* Microdata extras */}
          <meta itemProp="sku" content={_id} />
          {brand && <meta itemProp="brand" content={String(brand)} />}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RatingStars value={agg.average || (hasRating ? rating! : 4)} editable={false} />
            {totalReviews > 0 && (
              <a
                href="#reviews"
                className="text-sm text-accent underline underline-offset-2"
                onClick={() => {
                  try { logEvent({ action: 'jump_to_reviews', category: 'engagement', label: slug }) } catch {}
                }}
              >
                {totalReviews} avis
              </a>
            )}
            <FreeShippingBadge price={price} minimal />
            {typeof stock === 'number' && (
              <span
                className={cn(
                  'text-xs px-2 py-1 rounded-full border',
                  stock > 0
                    ? lowStock
                      ? 'border-amber-300 text-amber-700 dark:text-amber-300'
                      : 'border-emerald-300 text-emerald-700 dark:text-emerald-300'
                    : 'border-red-300 text-red-600 dark:text-red-400'
                )}
                aria-live="polite"
              >
                {stock > 0 ? (lowStock ? `Plus que ${stock} en stock` : 'En stock') : 'Rupture'}
              </span>
            )}
          </div>

          {lowStock && (
            <div className="mt-2">
              <div className="h-2 w-full rounded-full bg-amber-100 dark:bg-amber-900/30 overflow-hidden" aria-hidden>
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${Math.min(100, (stock! / 5) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">Dépêchez-vous, bientôt épuisé</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-end gap-3" aria-live="polite">
            <span
              className="text-3xl font-extrabold text-brand"
              aria-label={`Prix : ${formatPrice(price)}`}
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <meta itemProp="priceCurrency" content={currency} />
              <meta itemProp="price" content={priceStr} />
              <meta itemProp="availability" content={availability} />
              {formatPrice(price, { currency })}
            </span>
            {typeof oldPrice === 'number' && oldPrice > price && (
              <span className="line-through text-gray-400 dark:text-gray-500">{formatPrice(oldPrice, { currency })}</span>
            )}
            {discount && typeof oldPrice === 'number' && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                Économisez {formatPrice(oldPrice - price, { currency })} ({discount}%)
              </span>
            )}
            {quantity > 1 && (
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Total ({quantity}×)&nbsp;: <span className="font-semibold">{formatPrice(total, { currency })}</span>
              </span>
            )}
          </div>

          <div className="mt-3">
            <DeliveryEstimate />
          </div>

          {description && (
            <p
              className="mt-6 text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-lg"
              itemProp="description"
            >
              {description}
            </p>
          )}

          {Array.isArray(tags) && tags.length > 0 && (
            <div className="mt-4">
              <ProductTags tags={tags} />
            </div>
          )}

          {/* Garanties & infos (légères, sans deps) */}
          <div className="mt-6 grid gap-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span aria-hidden>✅</span> Garantie 2 ans & retours sous 30 jours
            </div>
            <div className="flex items-center gap-2">
              <span aria-hidden>🔒</span> Paiement 100% sécurisé (CB/PayPal)
            </div>
            <div className="flex items-center gap-2">
              <span aria-hidden>⚡</span> Expédition en 24h ouvrées
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label htmlFor="quantity" className="text-lg font-semibold text-gray-900 dark:text-white">
              Quantité :
            </label>
            <QuantitySelector
              value={quantity}
              onChange={(q) => setQuantity(clamp(q, 1, 99))}
              id="quantity"
              aria-describedby="quantity-desc"
            />
          </div>
          <p id="quantity-desc" className="sr-only">Sélectionnez la quantité à ajouter au panier</p>

          {!(typeof stock === 'number' && stock <= 0) ? (
            <AddToCartButtonAB
              product={{ _id, slug, title, price, image: gallery[0] ?? image, quantity }}
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
              aria-label={`Ajouter ${title} au panier`}
            />
          ) : (
            <div
              className="inline-flex items-center justify-center rounded-lg border border-red-300 px-4 py-3 text-red-700 dark:text-red-300"
              role="alert"
            >
              Indisponible actuellement
              <button
                type="button"
                onClick={() => toast('🔔 Nous pouvons vous prévenir quand il revient !')}
                className="ml-3 underline underline-offset-2"
              >
                Me prévenir
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {/* WishlistButton ne possède pas de prop onClick → on entoure d’un wrapper cliquable */}
            <div className="inline-block" onClick={onAddWishlist}>
              <WishlistButton
                product={{ _id, slug, title, price, image: gallery[0] ?? image }}
                floating={false}
                className="mt-2"
              />
            </div>

            <button
              onClick={share}
              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Partager"
              title="Partager"
            >
              <IconShare />
              <span>Partager</span>
            </button>

            {/* Moyens de paiement (logos accessibles, theme-aware) */}
            <div className="mt-2 ml-auto flex items-center gap-3 text-2xl text-token-text/60">
              <span className="text-xs font-medium mr-1">Paiements :</span>
              <FaCcVisa aria-hidden="true" title="Visa" className="transition-opacity hover:opacity-90" />
              <FaCcMastercard aria-hidden="true" title="Mastercard" className="transition-opacity hover:opacity-90" />
              <FaCcPaypal aria-hidden="true" title="PayPal" className="transition-opacity hover:opacity-90" />
              <span className="sr-only" id="pay-methods">Paiements acceptés : Visa, Mastercard, PayPal</span>
            </div>
          </div>

          {/* Simulateur d’expédition — props requis */}
          <div className="mt-2">
            <ShippingSimulator minDays={2} maxDays={3} businessDaysOnly />
          </div>

          {/* Infos supplémentaires */}
          <div className="mt-2 grid gap-2">
            <details className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
              <summary className="cursor-pointer font-semibold">Livraison & retours</summary>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                <li>Livraison 48–72h en France métropolitaine</li>
                <li>Retour gratuit sous 30 jours</li>
                <li>Suivi colis temps réel</li>
              </ul>
            </details>
            <details className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
              <summary className="cursor-pointer font-semibold">Spécifications</summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {brand ? <>Marque&nbsp;: <strong>{String(brand)}</strong></> : 'Caractéristiques détaillées disponibles sur la fiche.'}
              </p>
            </details>
          </div>
        </div>
      </div>

      {/* Résumé sticky (mobile) */}
      <StickyCartSummary locale={safeLocale} />

      {/* Avis */}
      <div className="lg:col-span-2 mt-12" id="reviews" aria-label="Avis clients">
        <div className="mb-6">
          <RatingSummary
            average={agg.average}
            total={totalReviews}
            breakdownCount={agg.breakdownCount}
            jsonLd={{ productSku: _id, productName: title }}
          />
        </div>

        {Array.isArray(reviews) && reviews.length > 0 && (
          <div className="mb-10">
            <ProductReviews reviews={reviews} />
          </div>
        )}

        <ReviewForm productId={_id} />
      </div>

      {/* NOTE: Le JSON-LD est injecté au niveau de la page (/products/[slug]) via <ProductJsonLd /> */}
    </motion.section>
  )
}
