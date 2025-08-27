// src/components/ProductCard.tsx — ULTIME++ (premium icons, a11y/SEO/UX/Perf max)
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
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'

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

/** Blur tiny placeholder autonome (évite dépendance fichier) */
const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYikiIGZpbGw9IiNlZWUiIC8+PC9zdmc+'

/* ---------- Premium inline icons ---------- */
function IconStarSolid({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      />
    </svg>
  )
}

function Stars({ rating, count }: { rating?: number; count?: number }) {
  if (!(typeof rating === 'number') || Number.isNaN(rating)) return null
  const full = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <div className="flex items-center gap-1 text-[12px]" aria-label={String(rating) + '/5'}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStarSolid key={i} size={14} className={i < full ? 'opacity-100 text-yellow-500' : 'opacity-30'} />
      ))}
      {typeof count === 'number' && <span className="text-token-text/60 ml-1">({count})</span>}
    </div>
  )
}

/** URL absolue (pour microdonnées) */
const toAbs = (u?: string) =>
  !u ? '' : u.startsWith('http') ? u : (typeof window !== 'undefined' ? window.location.origin + u : u)

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
    images,
    rating,
    isNew,
    isBestSeller,
    stock,
    brand,
    // ❌ ne pas déstructurer `tags` (certains envs ont un type Product sans ce champ)
  } = product ?? {}

  // Champs étendus tolérants
  const x = product as any
  const reviewsCount: number | undefined =
    typeof x?.reviewsCount === 'number'
      ? x.reviewsCount
      : typeof x?.reviews === 'number'
      ? x.reviews
      : undefined
  const sku: string | undefined = typeof x?.sku === 'string' ? x.sku : (x?.id ? String(x.id) : undefined)
  const tags: string[] | undefined = Array.isArray(x?.tags) ? (x.tags as string[]).filter(Boolean) : undefined

  const prefersReducedMotion = useReducedMotion()

  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const cardRef = useRef<HTMLDivElement | null>(null)
  const viewedRef = useRef(false)

  // Tilt state + rAF throttle
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 })
  const ticking = useRef(false)

  // Images: principale + hover
  const mainImage = useMemo(() => {
    const first = Array.isArray(images) && images.length ? images[0] : image
    return imgError ? '/placeholder.png' : (first || '/placeholder.png')
  }, [images, image, imgError])
  const hoverImage = useMemo(() => {
    const second = Array.isArray(images) && images.length > 1 ? images[1] : undefined
    return second || null
  }, [images])

  // Prix, remises, stock
  const discount = useMemo(
    () =>
      typeof oldPrice === 'number' && oldPrice > price
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : null,
    [oldPrice, price]
  )
  const savingsEuro = useMemo(
    () => (typeof oldPrice === 'number' && oldPrice > price ? Math.max(0, oldPrice - price) : null),
    [oldPrice, price]
  )

  const hasRating = typeof rating === 'number' && !Number.isNaN(rating)

  // i18n — URL localisée
  const locale = getCurrentLocale()
  const productUrl = useMemo(
    () => (slug ? localizePath('/products/' + slug, locale) : '#'),
    [slug, locale]
  )

  const priceContent = useMemo(() => Math.max(0, Number(price || 0)).toFixed(2), [price])
  const availability =
    typeof stock === 'number'
      ? stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock'
      : undefined
  const lowStock = typeof stock === 'number' && stock > 0 && stock <= 5
  const outOfStock = typeof stock === 'number' && stock <= 0

  // A11y announce composition
  const srId = useRef('sr-' + Math.random().toString(36).slice(2)).current
  const describes: string[] = []
  if (typeof discount === 'number') describes.push('Économie ' + String(discount) + '%')
  if (lowStock) describes.push('Stock faible')
  if (outOfStock) describes.push('Rupture')
  const ariaDescribedBy = describes.length ? srId : undefined

  /* Impression de la carte */
  useEffect(() => {
    if (!cardRef.current || viewedRef.current) return
    const el = cardRef.current
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !viewedRef.current) {
            viewedRef.current = true
            try {
              logEvent({
                action: 'product_card_view',
                category: 'engagement',
                label: title,
                value: price,
              })
            } catch {}
            try {
              pushDataLayer({
                event: 'view_item_card',
                items: [{ item_id: _id || sku, item_name: title, price }],
              })
            } catch {}
          }
        }
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [_id, sku, title, price])

  /* Click tracking + safety no-slug */
  const handleClick = useCallback((e?: React.MouseEvent) => {
    if (!slug) { if (e) e.preventDefault() }
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
        items: [{ item_id: _id || sku, item_name: title, price }],
      })
    } catch {}
  }, [_id, sku, slug, title, price])

  /* Tilt 3D */
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return
    try {
      if (window.matchMedia && !window.matchMedia('(hover:hover)').matches) return
    } catch {}
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
      aria-label={'Produit : ' + title}
      aria-describedby={ariaDescribedBy}
      itemScope
      itemType="https://schema.org/Product"
      className={cn(
        'group relative rounded-3xl p-[1px]',
        // Anneau conique premium (cohérent tokens)
        'ring-conic',
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
      data-sku={sku}
      data-price={price}
      data-gtm="product_card"
    >
      {/* Microdonnées enrichies */}
      <meta itemProp="name" content={title} />
      <meta itemProp="image" content={toAbs(mainImage)} />
      {slug && <meta itemProp="url" content={productUrl} />}
      {brand && <meta itemProp="brand" content={String(brand)} />}
      {sku && <meta itemProp="sku" content={sku} />}
      {hasRating && (
        <span
          itemProp="aggregateRating"
          itemScope
          itemType="https://schema.org/AggregateRating"
          className="sr-only"
        >
          <meta itemProp="ratingValue" content={rating!.toFixed(1)} />
          {typeof reviewsCount === 'number' && (
            <meta itemProp="reviewCount" content={String(Math.max(0, reviewsCount))} />
          )}
        </span>
      )}

      <motion.div
        className={cn(
          'relative overflow-hidden rounded-[inherit]',
          'bg-white/80 dark:bg-zinc-900/80 supports-[backdrop-filter]:backdrop-blur',
          'border border-white/40 dark:border-white/10 ring-1 ring-gray-200/60 dark:ring-gray-800/60'
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
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(700px 220px at 12% -10%, rgba(255,255,255,0.35), transparent 60%)',
          }}
        />

        {/* --- Zone cliquable (image + contenu) --- */}
        <Link
          href={productUrl}
          prefetch={false}
          className="block rounded-[inherit] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.60)]"
          aria-label={'Voir la fiche produit : ' + title}
          onClick={handleClick}
        >
          {/* Image (double couche pour swap au hover si images[1]) */}
          <div className="relative aspect-[4/3] w-full bg-gray-100 dark:bg-zinc-800" aria-busy={!imgLoaded}>
            {/* Image principale */}
            <Image
              src={mainImage}
              alt={'Image du produit ' + title}
              fill
              sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 100vw"
              className={cn(
                'object-cover transition-transform duration-700 will-change-transform',
                hoverImage ? 'opacity-100 group-hover:opacity-0' : 'group-hover:scale-105'
              )}
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              quality={85}
              onError={() => setImgError(true)}
              onLoadingComplete={() => setImgLoaded(true)}
              decoding="async"
              draggable={false}
            />
            {/* Image hover (si dispo) */}
            {hoverImage && (
              <Image
                src={hoverImage}
                alt=""
                fill
                sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 100vw"
                className="object-cover opacity-0 transition-opacity duration-500 will-change-auto group-hover:opacity-100"
                aria-hidden="true"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                quality={85}
                decoding="async"
                draggable={false}
              />
            )}

            {/* Skeleton / shimmer */}
            {!imgLoaded && (
              <div
                className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200/70 to-gray-100/40 dark:from-zinc-800/60 dark:to-zinc-900/40"
                aria-hidden="true"
              />
            )}

            {/* Badges */}
            <div className="pointer-events-none absolute left-3 top-3 z-10 flex select-none flex-col gap-2">
              {isNew && (
                <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow">
                  Nouveau
                </span>
              )}
              {isBestSeller && (
                <span className="rounded-full bg-yellow-400 px-2.5 py-0.5 text-[11px] font-semibold text-black shadow">
                  Best Seller
                </span>
              )}
              {typeof discount === 'number' && (
                <span
                  className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow"
                  aria-label={String(discount) + '% de réduction'}
                >
                  {'-' + String(discount) + '%'}
                </span>
              )}
              {lowStock && (
                <span className="rounded-full bg-amber-300/90 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 shadow">
                  Stock faible
                </span>
              )}
            </div>

            {/* Note */}
            {(hasRating || typeof reviewsCount === 'number') && (
              <div className="absolute right-3 top-3 grid gap-1 text-right">
                {hasRating && (
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/60 bg-white/90 px-2.5 py-1 text-xs shadow backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90"
                    aria-label={'Note moyenne : ' + rating!.toFixed(1) + ' étoiles'}
                  >
                    <IconStarSolid className="text-yellow-500" size={14} />
                    <span>{rating!.toFixed(1)}</span>
                  </div>
                )}
                <Stars rating={rating} count={reviewsCount} />
              </div>
            )}

            {/* Overlay rupture */}
            {outOfStock && (
              <div
                aria-hidden
                className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-semibold text-white"
              >
                Rupture
              </div>
            )}

            {/* Vignette subtile bas */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" aria-hidden />
          </div>

          {/* Contenu */}
          <div className="p-4 sm:p-5">
            <h3 className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-white sm:text-lg" title={title}>
              {title}
            </h3>

            {/* Tags (optionnels) */}
            {Array.isArray(tags) && tags.length > 0 && (
              <p className="mt-1 line-clamp-1 text-[11px] text-gray-500 dark:text-gray-400">
                {tags.slice(0, 3).join(' • ')}
              </p>
            )}

            <div
              className="mt-2 flex flex-wrap items-center gap-3 sm:mt-3"
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <meta itemProp="priceCurrency" content="EUR" />
              <meta itemProp="price" content={priceContent} />
              {availability && <link itemProp="availability" href={availability} />}
              <meta itemProp="itemCondition" content="https://schema.org/NewCondition" />

              <span
                className="text-lg font-extrabold text-brand sm:text-xl"
                aria-label={'Prix : ' + formatPrice(price)}
              >
                {formatPrice(price)}
              </span>

              {typeof oldPrice === 'number' && oldPrice > price && (
                <span className="text-sm text-gray-400 line-through dark:text-gray-500" aria-label="Ancien prix">
                  {formatPrice(oldPrice)}
                </span>
              )}

              {typeof discount === 'number' && typeof oldPrice === 'number' && (
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  {'-' + String(discount) + '%'}
                </span>
              )}
            </div>

            {/* Économies (si dispo) */}
            {typeof savingsEuro === 'number' && savingsEuro > 0 && (
              <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Vous économisez {formatPrice(savingsEuro)}
              </p>
            )}

            <FreeShippingBadge price={price} minimal className="mt-2" />
          </div>
        </Link>

        {/* Actions flottantes (hors du <Link>) */}
        {showWishlistIcon && (
          <div className="absolute bottom-4 right-4 z-20">
            <WishlistButton
              product={{ _id, slug: slug || '', title, price, image: mainImage }}
              aria-label={'Ajouter ' + title + ' à la liste de souhaits'}
            />
          </div>
        )}

        {showAddToCart && (
          <div className="absolute bottom-4 left-4 z-20">
            <AddToCartButton
              product={{ _id, slug: slug || '', title, price, image: mainImage }}
              size="sm"
              aria-label={'Ajouter ' + title + ' au panier'}
              disabled={outOfStock}
            />
          </div>
        )}
      </motion.div>

      {/* SR live attaché si nécessaire */}
      {ariaDescribedBy && (
        <p id={srId} className="sr-only" aria-live="polite">
          {describes.join('. ')}
        </p>
      )}
    </motion.article>
  )
}
