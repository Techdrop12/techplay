// src/components/ProductDetail.tsx
'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { formatPrice } from '@/lib/utils'
import WishlistButton from '@/components/WishlistButton'
import FreeShippingBadge from '@/components/FreeShippingBadge'
import QuantitySelector from '@/components/QuantitySelector'
import RatingStars from '@/components/ui/RatingStars'
import PricingBadge from '@/components/PricingBadge'
import AddToCartButton from '@/components/AddToCartButton'
import ReviewForm from '@/components/ReviewForm'
import StickyCartSummary from '@/components/StickyCartSummary'
import ProductTags from '@/components/ProductTags'
import type { Product } from '@/types/product'
import { logEvent } from '@/lib/logEvent'
import { trackViewItem } from '@/lib/ga'

interface Props {
  product: Product
  locale?: string
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

/** Blur inline ultra-léger (fallback si fichier LQIP absent) */
const BLUR_SVG =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 24'><filter id='b'><feGaussianBlur stdDeviation='1.5'/></filter><rect width='32' height='24' fill='#e5e7eb'/><g filter='url(#b)'><rect width='32' height='24' fill='#f3f4f6'/></g></svg>`
  )

export default function ProductDetail({ product, locale = 'fr' }: Props) {
  const prefersReducedMotion = useReducedMotion()

  const [quantity, setQuantity] = useState<number>(1)
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const viewedRef = useRef(false)
  const sectionRef = useRef<HTMLElement | null>(null)

  const {
    _id,
    slug = '',
    title = 'Produit',
    price = 0,
    oldPrice,
    image = '/placeholder.png',
    images = [],
    description = '',
    rating,
    isNew,
    isBestSeller,
    tags,
    // facultatifs si présents dans ton type
    stock,
    brand,
    sku,
    gtin,
    currency = 'EUR',
    reviewCount,
  } = product ?? {}

  // --- Galerie (image + images[]) ---
  const gallery = useMemo(() => {
    const list = [image, ...images].filter(Boolean) as string[]
    // uniq conservant l’ordre
    return Array.from(new Set(list))
  }, [image, images])
  const [index, setIndex] = useState(0)
  useEffect(() => { setIndex(0) }, [slug]) // reset à changement de produit

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

  // GTIN auto (8/12/13/14)
  type GTINProp = 'gtin8' | 'gtin12' | 'gtin13' | 'gtin14'
  const gtinStr = typeof gtin === 'number' ? String(gtin) : (gtin || '')
  const gtinProp: GTINProp | undefined =
    gtinStr.length === 8 ? 'gtin8'
      : gtinStr.length === 12 ? 'gtin12'
      : gtinStr.length === 13 ? 'gtin13'
      : gtinStr.length === 14 ? 'gtin14'
      : undefined

  // Log “vue fiche produit” + GA4 view_item une seule fois quand visible
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
              items: [{ item_id: _id, item_name: title, price, quantity: 1 }],
            })
          } catch {}
        }
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [_id, title, price, currency])

  const handleAdd = useCallback(() => {
    try {
      logEvent({ action: 'add_to_cart', category: 'ecommerce', label: title, value: price * quantity })
    } catch {}
  }, [title, price, quantity])

  // ---- Gestes galerie (clavier + swipe) ----
  const galleryRef = useRef<HTMLDivElement | null>(null)
  const prev = () => setIndex((i) => (i <= 0 ? gallery.length - 1 : i - 1))
  const next = () => setIndex((i) => (i >= gallery.length - 1 ? 0 : i + 1))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!galleryRef.current) return
      const activeInside = galleryRef.current.contains(document.activeElement)
      if (!activeInside) return
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
      if (e.key === 'ArrowRight') { e.preventDefault(); next() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gallery.length])

  const startX = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX }
  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current == null) return
    const delta = e.touches[0].clientX - startX.current
    if (Math.abs(delta) > 60) { delta > 0 ? prev() : next(); startX.current = null }
  }
  const onTouchEnd = () => { startX.current = null }

  // JSON-LD (Product + Offer) enrichi
  const jsonLd = useMemo(() => {
    const data: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      image: gallery.length ? gallery : [image],
      description: description || undefined,
      sku: sku || _id,
      brand: brand ? { '@type': 'Brand', name: String(brand) } : undefined,
      ...(gtinProp ? { [gtinProp]: gtinStr } : null),
      offers: {
        '@type': 'Offer',
        priceCurrency: currency,
        price: priceStr,
        availability,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        itemCondition: 'https://schema.org/NewCondition',
      },
    }
    if (hasRating) {
      data.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: Number(rating!.toFixed(1)),
        reviewCount: Number(reviewCount ?? 12),
      }
    }
    return data
  }, [
    title, gallery, image, description, sku, _id, brand, gtinProp, gtinStr,
    currency, priceStr, availability, hasRating, rating, reviewCount,
  ])

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
      {/* 📸 Galerie produit */}
      <div
        ref={galleryRef}
        className="space-y-4"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
          <Image
            key={gallery[index] || image}
            src={imgError ? '/placeholder.png' : gallery[index] || image}
            alt={`Image ${index + 1} du produit ${title}`}
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            placeholder="blur"
            blurDataURL={BLUR_SVG}
            onError={() => setImgError(true)}
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

          {/* Pricing badge */}
          <div className="absolute bottom-4 right-4 z-10">
            <PricingBadge price={price} oldPrice={oldPrice} showDiscountLabel showOldPrice />
          </div>

          {/* Badges statut */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none select-none z-10">
            {isNew && (
              <span className="bg-green-600 text-white px-3 py-1 rounded-full font-semibold text-sm shadow-md">
                Nouveau
              </span>
            )}
            {isBestSeller && (
              <span className="bg-yellow-400 text-black px-3 py-1 rounded-full font-semibold text-sm shadow-md">
                Best Seller
              </span>
            )}
            {discount && (
              <span className="bg-red-600 text-white px-3 py-1 rounded-full font-semibold text-sm shadow-md">
                -{discount}%
              </span>
            )}
          </div>

          {/* Flèches (accessibles clavier) si plusieurs visuels */}
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Image précédente"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 text-white px-3 py-2 backdrop-blur-md hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Image suivante"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 text-white px-3 py-2 backdrop-blur-md hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {gallery.length > 1 && (
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-6 gap-3">
            {gallery.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Voir l’image ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                className={[
                  'relative aspect-square rounded-xl overflow-hidden border transition',
                  i === index
                    ? 'border-accent ring-2 ring-accent'
                    : 'border-gray-200 dark:border-gray-700 hover:border-accent/60',
                ].join(' ')}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="15vw"
                  placeholder="blur"
                  blurDataURL={BLUR_SVG}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 📝 Infos produit */}
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

          {/* Note + badge livraison + stock */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RatingStars value={hasRating ? rating! : 4} editable={false} />
            <FreeShippingBadge price={price} minimal />
            {typeof stock === 'number' && (
              <span
                className={`text-xs px-2 py-1 rounded-full border ${
                  stock > 0
                    ? lowStock
                      ? 'border-amber-300 text-amber-700 dark:text-amber-300'
                      : 'border-emerald-300 text-emerald-700 dark:text-emerald-300'
                    : 'border-red-300 text-red-600 dark:text-red-400'
                }`}
                aria-live="polite"
              >
                {stock > 0 ? (lowStock ? `Plus que ${stock} en stock` : 'En stock') : 'Rupture'}
              </span>
            )}
          </div>

          {/* Bloc prix */}
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
              {formatPrice(price)}
            </span>
            {typeof oldPrice === 'number' && oldPrice > price && (
              <span className="line-through text-gray-400 dark:text-gray-500">
                {formatPrice(oldPrice)}
              </span>
            )}
            {discount && typeof oldPrice === 'number' && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                Économisez {formatPrice(oldPrice - price)} ({discount}%)
              </span>
            )}
          </div>

          {description && (
            <p className="mt-6 text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-lg" itemProp="description">
              {description}
            </p>
          )}

          {Array.isArray(tags) && tags.length > 0 && (
            <div className="mt-4">
              <ProductTags tags={tags} />
            </div>
          )}
        </div>

        {/* 🛒 Actions */}
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
          <p id="quantity-desc" className="sr-only">
            Sélectionnez la quantité à ajouter au panier
          </p>

          {!(typeof stock === 'number' && stock <= 0) ? (
            <AddToCartButton
              product={{ _id, slug, title, price, image: gallery[0] || image, quantity }}
              onAdd={handleAdd}
              size="lg"
              aria-label={`Ajouter ${title} au panier`}
            />
          ) : (
            <div className="inline-flex items-center justify-center rounded-lg border border-red-300 px-4 py-3 text-red-700 dark:text-red-300" role="alert">
              Indisponible actuellement
            </div>
          )}

          <WishlistButton product={{ _id, slug, title, price, image: gallery[0] || image }} floating={false} className="mt-2" />

          {/* Métadonnées invisibles utiles aux crawlers */}
          {brand && <meta itemProp="brand" content={String(brand)} />}
          {sku && <meta itemProp="sku" content={String(sku)} />}
          {gtinProp && <meta itemProp={gtinProp} content={gtinStr} />}
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
