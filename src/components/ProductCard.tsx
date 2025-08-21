// src/components/ProductCard.tsx
'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  useCallback,
} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { cn, formatPrice } from '@/lib/utils'
import WishlistButton from '@/components/WishlistButton'
import FreeShippingBadge from '@/components/FreeShippingBadge'
import AddToCartButton from '@/components/AddToCartButton'
import type { Product } from '@/types/product'
import { logEvent } from '@/lib/logEvent'
import { pushDataLayer } from '@/lib/ga'

interface ProductCardProps {
  product: Product
  /** Priorise le chargement de l’image (LCP) */
  priority?: boolean
  /** Afficher le bouton wishlist */
  showWishlistIcon?: boolean
  /** Afficher le CTA “Ajouter au panier” */
  showAddToCart?: boolean
  /** Classe(s) personnalisée(s) */
  className?: string
}

/** Clamp helper */
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export default function ProductCard({
  product,
  priority = false,
  showWishlistIcon = false,
  showAddToCart = true,
  className,
}: ProductCardProps) {
  const {
    _id = '',
    slug,
    title = 'Produit',
    price = 0,
    oldPrice,
    image = '/placeholder.png',
    // si ton type a un tableau d’images, on prend la 1re
    images,
    rating,
    isNew,
    isBestSeller,
    stock,
    brand,
    tags,
  } = product ?? {}

  const prefersReducedMotion = useReducedMotion()

  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const cardRef = useRef<HTMLDivElement | null>(null)
  const viewedRef = useRef(false)

  // Tilt state + rAF throttle
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 })
  const ticking = useRef(false)

  // Image finale (images[0] > image > placeholder)
  const mainImage = useMemo(() => {
    const first = Array.isArray(images) && images.length ? images[0] : image
    return imgError ? '/placeholder.png' : (first || '/placeholder.png')
  }, [images, image, imgError])

  const discount = useMemo(
    () =>
      typeof oldPrice === 'number' && oldPrice > price
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : null,
    [oldPrice, price]
  )

  const hasRating = typeof rating === 'number' && !Number.isNaN(rating)
  const productUrl = useMemo(() => (slug ? `/produit/${slug}` : '#'), [slug])
  const priceContent = useMemo(() => Math.max(0, Number(price || 0)).toFixed(2), [price])
  const availability =
    typeof stock === 'number'
      ? stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock'
      : undefined
  const lowStock = typeof stock === 'number' && stock > 0 && stock <= 5

  /* -------------------------- Impression de la carte ------------------------- */
  useEffect(() => {
    if (!cardRef.current || viewedRef.current) return
    const el = cardRef.current
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !viewedRef.current) {
            viewedRef.current = true
            // Event custom (tolérant)
            try {
              logEvent({
                action: 'product_card_view',
                category: 'engagement',
                label: title,
                value: price,
              })
            } catch {}
            // DataLayer (utile si GTM/GA4 via GTM)
            try {
              pushDataLayer({
                event: 'view_item_card',
                items: [{ item_id: _id, item_name: title, price }],
              })
            } catch {}
          }
        }
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [_id, title, price])

  /* ---------------------------- Click tracking ------------------------------- */
  const handleClick = useCallback(() => {
    try {
      logEvent({
        action: 'product_card_click',
        category: 'engagement',
        label: title,
        value: price,
      })
    } catch {}
    try {
      pushDataLayer({
        event: 'select_item',
        item_list_name: 'product_grid',
        items: [{ item_id: _id, item_name: title, price }],
      })
    } catch {}
  }, [_id, title, price])

  /* ------------------------------- Tilt 3D ----------------------------------- */
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return
    if (window.matchMedia && !window.matchMedia('(hover:hover)').matches) return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const ry = clamp((dx / (r.width / 2)) * 6, -8, 8) // rotateY
    const rx = clamp((-dy / (r.height / 2)) * 6, -8, 8) // rotateX
    if (ticking.current) return
    ticking.current = true
    requestAnimationFrame(() => {
      setTilt({ rx, ry })
      ticking.current = false
    })
  }
  const resetTilt = () => setTilt({ rx: 0, ry: 0 })

  return (
    <motion.article
      ref={cardRef}
      role="listitem"
      aria-label={`Produit : ${title}`}
      itemScope
      itemType="https://schema.org/Product"
      className={cn(
        'group relative rounded-3xl p-[1px] bg-gradient-to-br from-accent/25 via-transparent to-transparent',
        'shadow-sm hover:shadow-2xl transition-shadow',
        className
      )}
      style={{ perspective: 1000 }}
      whileHover={!prefersReducedMotion ? { scale: 1.015 } : undefined}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onMouseMove={onMouseMove}
      onMouseLeave={resetTilt}
      data-product-id={_id}
      data-product-slug={slug}
    >
      {/* Microdonnées simples */}
      <meta itemProp="name" content={title} />
      <meta itemProp="image" content={mainImage} />
      {slug && <meta itemProp="url" content={productUrl} />}
      {brand && <meta itemProp="brand" content={String(brand)} />}

      <motion.div
        className={cn(
          'relative rounded-[inherit] overflow-hidden',
          'bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800'
        )}
        style={
          !prefersReducedMotion
            ? { rotateX: tilt.rx, rotateY: tilt.ry, transformStyle: 'preserve-3d' as const }
            : {}
        }
      >
        {/* Shine subtil sur hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background:
              'radial-gradient(600px 200px at 10% -10%, rgba(255,255,255,0.35), transparent 60%)',
          }}
        />

        {/* --- Zone cliquable (image + contenu) --- */}
        <Link
          href={productUrl}
          prefetch
          className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/60 rounded-[inherit]"
          aria-label={`Voir la fiche produit : ${title}`}
          onClick={handleClick}
        >
          {/* Image */}
          <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-zinc-800" aria-busy={!imgLoaded}>
            <Image
              src={mainImage}
              alt={`Image du produit ${title}`}
              fill
              sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 100vw"
              className={cn(
                'object-cover transition-transform duration-700 will-change-transform',
                'group-hover:scale-105'
              )}
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              placeholder="blur"
              blurDataURL="/placeholder-blur.png"
              onError={() => setImgError(true)}
              onLoadingComplete={() => setImgLoaded(true)}
              decoding="async"
              draggable={false}
            />

            {/* Skeleton / shimmer */}
            {!imgLoaded && (
              <div
                className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200/70 to-gray-100/40 dark:from-zinc-800/60 dark:to-zinc-900/40"
                aria-hidden="true"
              />
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 select-none pointer-events-none">
              {isNew && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white bg-green-600 shadow">
                  Nouveau
                </span>
              )}
              {isBestSeller && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-black bg-yellow-400 shadow">
                  Best Seller
                </span>
              )}
              {discount && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white bg-red-600 shadow"
                  aria-label={`${discount}% de réduction`}
                >
                  -{discount}%
                </span>
              )}
              {lowStock && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-amber-900 bg-amber-300/90 shadow">
                  Stock faible
                </span>
              )}
            </div>

            {/* Note */}
            {hasRating && (
              <div
                className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-900/90 border border-gray-200/60 dark:border-zinc-800 text-xs px-2.5 py-1 rounded-full shadow backdrop-blur-sm"
                aria-label={`Note moyenne : ${rating!.toFixed(1)} étoiles`}
              >
                <span className="text-yellow-500">★</span> {rating!.toFixed(1)}
              </div>
            )}

            {/* Overlay rupture */}
            {typeof stock === 'number' && stock <= 0 && (
              <div
                aria-hidden
                className="absolute inset-0 grid place-items-center bg-black/45 text-white text-sm font-semibold"
              >
                Rupture
              </div>
            )}

            {/* Vignette subtil bas */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" aria-hidden />
          </div>

          {/* Contenu */}
          <div className="p-4 sm:p-5">
            <h3 className="font-semibold text-base sm:text-lg line-clamp-2 text-gray-900 dark:text-white" title={title}>
              {title}
            </h3>

            {/* Tags (optionnel si présents) */}
            {Array.isArray(tags) && tags.length > 0 && (
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                {tags.slice(0, 3).join(' • ')}
              </p>
            )}

            <div
              className="mt-2 sm:mt-3 flex items-center gap-3"
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <span
                className="text-brand font-extrabold text-lg sm:text-xl"
                aria-label={`Prix : ${formatPrice(price)}`}
              >
                <meta itemProp="priceCurrency" content="EUR" />
                <meta itemProp="price" content={priceContent} />
                {availability && <meta itemProp="availability" content={availability} />}
                {formatPrice(price)}
              </span>

              {typeof oldPrice === 'number' && oldPrice > price && (
                <span className="line-through text-sm text-gray-400 dark:text-gray-500" aria-label="Ancien prix">
                  {formatPrice(oldPrice)}
                </span>
              )}

              {discount && typeof oldPrice === 'number' && (
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  –{discount}%
                </span>
              )}
            </div>

            {/* AggregateRating (optionnel pour SEO) */}
            {hasRating && (
              <span
                itemProp="aggregateRating"
                itemScope
                itemType="https://schema.org/AggregateRating"
                className="sr-only"
              >
                <meta itemProp="ratingValue" content={rating!.toFixed(1)} />
                {/* Remplace 12 si tu as la vraie donnée */}
                <meta itemProp="reviewCount" content="12" />
              </span>
            )}

            <FreeShippingBadge price={price} minimal className="mt-2" />
          </div>
        </Link>

        {/* Actions flottantes (hors du <Link>) */}
        {showWishlistIcon && (
          <div className="absolute bottom-4 right-4 z-20">
            <WishlistButton
              product={{ _id, slug: slug ?? '', title, price, image: mainImage }}
              aria-label={`Ajouter ${title} à la liste de souhaits`}
            />
          </div>
        )}

        {showAddToCart && (
          <div className="absolute bottom-4 left-4 z-20">
            <AddToCartButton
              product={{ _id, slug: slug ?? '', title, price, image: mainImage }}
              size="sm"
              aria-label={`Ajouter ${title} au panier`}
              disabled={typeof stock === 'number' && stock <= 0}
            />
          </div>
        )}
      </motion.div>
    </motion.article>
  )
}
