// src/components/ProductDetail.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { formatPrice, cn } from '@/lib/utils'
import WishlistButton from '@/components/WishlistButton'
import FreeShippingBadge from '@/components/FreeShippingBadge'
import QuantitySelector from '@/components/QuantitySelector'
import RatingStars from '@/components/ui/RatingStars'
import PricingBadge from '@/components/PricingBadge'
import AddToCartButton from '@/components/AddToCartButton'
import ReviewForm from '@/components/ReviewForm'
import StickyCartSummary from '@/components/StickyCartSummary'
import ProductTags from '@/components/ProductTags'
import DeliveryEstimate from '@/components/ui/DeliveryEstimate'
import ShippingSimulator from '@/components/ShippingSimulator'
import type { Product } from '@/types/product'
import { toast } from 'react-hot-toast'
import { logEvent } from '@/lib/logEvent'
import {
  trackViewItem,
  trackAddToCart,
  trackAddToWishlist,
  trackSelectItem,
  mapProductToGaItem,
} from '@/lib/ga'

interface Props {
  product: Product
  locale?: string
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

// très petit blur inline (évite un asset supplémentaire)
const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYikiIGZpbGw9IiNlZWUiIC8+PC9zdmc+'

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

  // Unpack produit
  const {
    _id,
    slug = '',
    title = 'Produit',
    price = 0,
    oldPrice,
    image = '/placeholder.png',
    images,
    description = '',
    rating,
    isNew,
    isBestSeller,
    tags,
    stock,
    brand,
  } = product ?? {}

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

  const priceStr = useMemo(() => Math.max(0, Number(price || 0)).toFixed(2), [price])
  const availability =
    typeof stock === 'number'
      ? stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock'
      : 'https://schema.org/InStock'
  const lowStock = typeof stock === 'number' && stock > 0 && stock <= 5
  const total = useMemo(() => price * quantity, [price, quantity])

  /* ------------------------------------------------------------------------ */
  /*                           Tracking / Recently viewed                     */
  /* ------------------------------------------------------------------------ */

  // GA4 view_item (une fois visible)
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
              currency: 'EUR',
              value: price,
              items: [mapProductToGaItem(product, { quantity: 1 })],
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
  }, [product, title, price, _id, image, gallery])

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
        currency: 'EUR',
        value: total,
        items: [mapProductToGaItem(product, { quantity })],
      })
    } catch {}
  }, [title, total, product, quantity])

  const onAddWishlist = useCallback(() => {
    try { logEvent({ action: 'add_to_wishlist', category: 'ecommerce', label: title, value: price }) } catch {}
    try {
      trackAddToWishlist({
        currency: 'EUR',
        value: price,
        items: [mapProductToGaItem(product, { quantity: 1 })],
      })
    } catch {}
  }, [title, price, product])

  const onThumbSelect = (idx: number) => {
    setActiveIdx(idx)
    try {
      trackSelectItem({
        currency: 'EUR',
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
  /*                                  JSON-LD                                 */
  /* ------------------------------------------------------------------------ */
  const jsonLd = useMemo(() => {
    const data: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      image: gallery.length ? gallery : [image],
      description: description || undefined,
      sku: _id,
      brand: brand ? { '@type': 'Brand', name: String(brand) } : undefined,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: priceStr,
        availability,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: 'TechPlay' },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'FR',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 30,
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'EUR' },
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'FR' },
        },
      },
    }
    if (hasRating) {
      data.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: Number(rating!.toFixed(1)),
        reviewCount: 12, // remplace si tu as la vraie donnée
      }
    }
    return data
  }, [gallery, _id, title, image, description, brand, priceStr, availability, hasRating, rating])

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
      {/* -------------------------------------------------------------------- */}
      {/*                                Galerie                                */}
      {/* -------------------------------------------------------------------- */}
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
          role="img"
          aria-label={`Image ${activeIdx + 1} sur ${gallery.length} : ${title}`}
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
              className="rounded-full bg-white/90 dark:bg-black/60 border border-gray-200 dark:border-gray-700 px-3 py-1 text-sm shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Partager ce produit"
              title="Partager"
            >
              🔗
            </button>
          </div>
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

      {/* -------------------------------------------------------------------- */}
      {/*                           Infos + actions                             */}
      {/* -------------------------------------------------------------------- */}
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

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RatingStars value={hasRating ? rating! : 4} editable={false} />
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
              <div className="h-2 w-full rounded-full bg-amber-100 dark:bg-amber-900/30 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${Math.min(100, (stock! / 5) * 100)}%` }}
                  aria-hidden="true"
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
              <meta itemProp="priceCurrency" content="EUR" />
              <meta itemProp="price" content={priceStr} />
              <meta itemProp="availability" content={availability} />
              {formatPrice(price)}
            </span>
            {typeof oldPrice === 'number' && oldPrice > price && (
              <span className="line-through text-gray-400 dark:text-gray-500">{formatPrice(oldPrice)}</span>
            )}
            {discount && typeof oldPrice === 'number' && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                Économisez {formatPrice(oldPrice - price)} ({discount}%)
              </span>
            )}
            {quantity > 1 && (
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Total ({quantity}×)&nbsp;: <span className="font-semibold">{formatPrice(total)}</span>
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
            <AddToCartButton
              product={{ _id, slug, title, price, image: gallery[0] ?? image, quantity }}
              onAdd={onAddToCart}
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
              className="mt-2 inline-flex items-center rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Partager"
              title="Partager"
            >
              Partager
            </button>

            {/* Paiements “confiance” (juste visuel, pas de dépendances) */}
            <div className="mt-2 ml-auto flex items-center gap-2 opacity-80">
              <span className="text-xs">Paiements :</span>
              <span aria-hidden>💳</span>
              <span aria-hidden>🅿️</span>
              <span aria-hidden>🏦</span>
            </div>
          </div>

          {/* Simulateur d’expédition — props requis */}
          <div className="mt-2">
            <ShippingSimulator minDays={2} maxDays={3} businessDaysOnly />
          </div>

          {/* Infos supplémentaires en <details> (0 deps) */}
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
      <StickyCartSummary locale={locale} />

      {/* Avis */}
      <div className="lg:col-span-2 mt-12">
        <ReviewForm productId={_id} />
      </div>

      {/* JSON-LD SEO */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </motion.section>
  )
}
