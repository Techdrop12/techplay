// src/components/PackCard.tsx — ULTIME++ (futuriste, a11y/SEO/UX/Perf max)
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react'

import type { Pack } from '@/types/product'

import FreeShippingBadge from '@/components/FreeShippingBadge'
import Link from '@/components/LocalizedLink'
import { pushDataLayer } from '@/lib/ga'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'
import { logEvent } from '@/lib/logEvent'
import { cn, formatPrice } from '@/lib/utils'

interface PackCardProps {
  pack: Pack
  priority?: boolean
  className?: string
}

type UnknownRecord = Record<string, unknown>

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYikiIGZpbGw9IiNlZWUiIC8+PC9zdmc+'

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null

const getFirstValue = (record: UnknownRecord, keys: readonly string[]): unknown => {
  for (const key of keys) {
    const value = record[key]
    if (value !== undefined && value !== null) return value
  }
  return undefined
}

const toFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

const readString = (record: UnknownRecord, keys: readonly string[]): string | undefined => {
  const value = getFirstValue(record, keys)
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

const readNumber = (record: UnknownRecord, keys: readonly string[]): number | undefined => {
  const value = getFirstValue(record, keys)
  return toFiniteNumber(value)
}

const readBoolean = (record: UnknownRecord, keys: readonly string[]): boolean | undefined => {
  const value = getFirstValue(record, keys)

  if (typeof value === 'boolean') return value

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === '1') return true
    if (normalized === 'false' || normalized === '0') return false
  }

  return undefined
}

const readArray = (record: UnknownRecord, keys: readonly string[]): unknown[] | undefined => {
  const value = getFirstValue(record, keys)
  return Array.isArray(value) ? value : undefined
}

const normalizeImageSrc = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value.trim()

  if (isRecord(value)) {
    return readString(value, ['url', 'src', 'image', 'path'])
  }

  return undefined
}

const readImageList = (record: UnknownRecord, keys: readonly string[]): string[] | undefined => {
  const value = getFirstValue(record, keys)
  if (!Array.isArray(value)) return undefined

  const images = value
    .map((entry) => normalizeImageSrc(entry))
    .filter((entry): entry is string => Boolean(entry))

  return images.length > 0 ? images : undefined
}

const readIdString = (record: UnknownRecord, keys: readonly string[]): string | undefined => {
  const value = getFirstValue(record, keys)

  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)

  return undefined
}

const readItemPrice = (item: unknown): number | undefined => {
  if (!isRecord(item)) return undefined
  return readNumber(item, ['price', 'prix', 'amount', 'value'])
}

const readItemLabel = (item: unknown): string | undefined => {
  if (!isRecord(item)) return undefined
  return readString(item, ['title', 'name', 'label'])
}

/** URL absolue (pour microdonnées) */
const toAbs = (u?: string) =>
  !u ? '' : u.startsWith('http') ? u : typeof window !== 'undefined' ? window.location.origin + u : u

export default function PackCard({ pack, priority = false, className }: PackCardProps) {
  const { slug, title = 'Pack', description, image, price = 0, oldPrice } = pack

  const normalized = useMemo(() => {
    const record: UnknownRecord = isRecord(pack) ? pack : {}

    return {
      packRecord: record,
      images: readImageList(record, ['images']),
      compareAtPrice: readNumber(record, [
        'compareAtPrice',
        'compare_at_price',
        'referencePrice',
        'reference_price',
      ]),
      isNew: readBoolean(record, ['isNew', 'new']),
      isBestSeller: readBoolean(record, ['isBestSeller', 'bestSeller', 'bestseller']),
      stock: readNumber(record, ['stock']),
      items: readArray(record, ['items', 'contents']) ?? [],
      rating: readNumber(record, ['rating']),
      reviewsCount: readNumber(record, ['reviewsCount', 'reviews']),
      sku: readString(record, ['sku']) ?? readIdString(record, ['id']),
      brand: readString(record, ['brand']),
    }
  }, [pack])

  const { images, compareAtPrice, isNew, isBestSeller, stock, items, rating, reviewsCount, sku, brand } =
    normalized

  const prefersReducedMotion = useReducedMotion()
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const mainImage = useMemo(() => {
    const first = images?.[0] ?? normalizeImageSrc(image)
    return imgError ? '/placeholder.png' : first || '/placeholder.png'
  }, [images, image, imgError])

  const itemsValue = useMemo(() => {
    if (items.length === 0) return undefined

    let sum = 0
    for (const item of items) {
      const value = readItemPrice(item)
      if (typeof value === 'number') sum += value
    }

    return sum > 0 ? sum : undefined
  }, [items])

  const refPrice =
    typeof oldPrice === 'number' && oldPrice > price
      ? oldPrice
      : typeof compareAtPrice === 'number' && compareAtPrice > price
        ? compareAtPrice
        : typeof itemsValue === 'number' && itemsValue > price
          ? itemsValue
          : undefined

  const discountPct = useMemo(
    () => (typeof refPrice === 'number' ? Math.round(((refPrice - price) / refPrice) * 100) : null),
    [refPrice, price]
  )

  const savingsEuro = useMemo(
    () => (typeof refPrice === 'number' ? Math.max(0, refPrice - price) : null),
    [refPrice, price]
  )

  const locale = getCurrentLocale()
  const urlPath = slug
    ? localizePath(`/products/packs/${slug}`, locale)
    : localizePath('/products/packs', locale)

  const hasRating = typeof rating === 'number' && !Number.isNaN(rating)
  const formattedRating = hasRating ? rating.toFixed(1) : null
  const lowStock = typeof stock === 'number' && stock > 0 && stock <= 5
  const outOfStock = typeof stock === 'number' && stock <= 0

  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 })
  const ticking = useRef(false)

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return

    try {
      if (window.matchMedia && !window.matchMedia('(hover:hover)').matches) return
    } catch {}

    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = e.clientX - centerX
    const dy = e.clientY - centerY
    const ry = clamp((dx / (rect.width / 2)) * 6, -8, 8)
    const rx = clamp((-dy / (rect.height / 2)) * 6, -8, 8)

    if (ticking.current) return

    ticking.current = true
    requestAnimationFrame(() => {
      setTilt({ rx, ry })
      ticking.current = false
    })
  }

  const resetTilt = () => setTilt({ rx: 0, ry: 0 })

  const cardRef = useRef<HTMLDivElement | null>(null)
  const viewedRef = useRef(false)

  useEffect(() => {
    if (!cardRef.current || viewedRef.current) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !viewedRef.current) {
            viewedRef.current = true

            try {
              logEvent({
                action: 'pack_card_view',
                category: 'engagement',
                label: title,
                value: price,
              })
            } catch {}

            try {
              pushDataLayer({
                event: 'view_pack_card',
                items: [{ item_id: slug, item_name: title, price }],
              })
            } catch {}
          }
        }
      },
      { threshold: 0.35 }
    )

    io.observe(cardRef.current)
    return () => io.disconnect()
  }, [slug, title, price])

  const handleClick = useCallback(
    (e?: MouseEvent<HTMLAnchorElement>) => {
      try {
        logEvent({
          action: 'pack_card_click',
          category: 'engagement',
          label: title,
          value: price,
        })
      } catch {}

      try {
        pushDataLayer({
          event: 'select_pack',
          items: [{ item_id: slug, item_name: title, price }],
        })
      } catch {}

      if (!slug && e) e.preventDefault()
    },
    [slug, title, price]
  )

  const srId = useId()
  const describe = useMemo(() => {
    const parts: string[] = []
    if (typeof discountPct === 'number') parts.push(`Économie ${discountPct}%`)
    if (lowStock) parts.push('Stock faible')
    if (outOfStock) parts.push('Rupture')
    return parts
  }, [discountPct, lowStock, outOfStock])

  const ariaDescribedBy = describe.length > 0 ? srId : undefined

  const itemChips = useMemo(() => {
    if (items.length === 0) return []

    const labels: string[] = []

    for (const item of items) {
      const label = readItemLabel(item)
      if (label) labels.push(label)
      if (labels.length >= 3) break
    }

    return labels
  }, [items])

  const conicPercent =
    typeof discountPct === 'number' ? Math.max(8, Math.min(100, discountPct)) : 0

  const href = urlPath

  const articleStyle = useMemo<CSSProperties & { ['--ring-progress']?: string }>(() => {
    const style: CSSProperties & { ['--ring-progress']?: string } = {
      perspective: 1000,
    }

    if (!prefersReducedMotion) {
      style['--ring-progress'] = String(conicPercent)
    }

    return style
  }, [conicPercent, prefersReducedMotion])

  return (
    <motion.article
      ref={cardRef}
      itemScope
      itemType="https://schema.org/Product"
      className={cn(
        'group relative rounded-3xl p-[1px]',
        'ring-conic',
        'shadow-sm hover:shadow-2xl transition-shadow',
        className
      )}
      style={articleStyle}
      whileHover={!prefersReducedMotion ? { scale: 1.015 } : undefined}
      transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: 'easeOut' }}
      onMouseMove={onMouseMove}
      onMouseLeave={resetTilt}
      aria-describedby={ariaDescribedBy}
      data-pack-id={slug}
    >
      <meta itemProp="name" content={title} />
      <meta itemProp="image" content={toAbs(mainImage)} />
      <meta itemProp="url" content={toAbs(urlPath)} />
      {brand && <meta itemProp="brand" content={brand} />}
      {sku && <meta itemProp="sku" content={sku} />}

      {hasRating && formattedRating && (
        <div
          itemProp="aggregateRating"
          itemScope
          itemType="https://schema.org/AggregateRating"
          className="hidden"
        >
          <meta itemProp="ratingValue" content={formattedRating} />
          {typeof reviewsCount === 'number' && (
            <meta itemProp="reviewCount" content={String(Math.max(0, reviewsCount))} />
          )}
        </div>
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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(700px 220px at 12% -10%, rgba(255,255,255,0.35), transparent 60%)',
          }}
        />

        <Link
          href={href}
          prefetch={false}
          className="block rounded-[inherit] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.60)]"
          onClick={handleClick}
        >
          <div
            className="relative aspect-[4/3] w-full bg-gray-100 dark:bg-zinc-800 sm:aspect-[16/9]"
            aria-busy={!imgLoaded}
          >
            <Image
              src={mainImage}
              alt=""
              fill
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
              priority={priority}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              quality={85}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              decoding="async"
              draggable={false}
            />

            {!imgLoaded && (
              <div
                className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200/70 to-gray-100/40 dark:from-zinc-800/60 dark:to-zinc-900/40"
                aria-hidden
              />
            )}

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

              {typeof discountPct === 'number' && (
                <span
                  className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow"
                  aria-label={`${discountPct}% d’économie`}
                >
                  -{discountPct}%
                </span>
              )}

              {lowStock && (
                <span className="rounded-full bg-amber-300/90 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 shadow">
                  Stock faible
                </span>
              )}
            </div>

            {hasRating && formattedRating && (
              <div
                className="absolute right-3 top-3 rounded-full border border-gray-200/60 bg-white/90 px-2.5 py-1 text-xs shadow backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90"
                aria-label={`Note moyenne : ${formattedRating} étoiles`}
              >
                <span className="text-yellow-500">★</span> {formattedRating}
              </div>
            )}

            {outOfStock && (
              <div
                className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-semibold text-white"
                aria-hidden
              >
                Rupture
              </div>
            )}

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent"
              aria-hidden
            />
          </div>

          <div className="p-5 sm:p-6">
            <h3
              className="line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl"
              title={title}
            >
              {title}
            </h3>

            {items.length > 0 && (
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                {items.length} article{items.length > 1 ? 's' : ''} inclus
              </p>
            )}

            {itemChips.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Aperçu des articles">
                {itemChips.map((itemName, index) => (
                  <li
                    key={`${itemName}-${index}`}
                    className="rounded-md border border-token-border bg-token-surface px-2 py-1 text-[11px] text-token-text/80"
                  >
                    {itemName}
                  </li>
                ))}
              </ul>
            )}

            {description && (
              <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}

            <div
              className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mt-4"
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <meta itemProp="priceCurrency" content="EUR" />
              <meta itemProp="itemCondition" content="https://schema.org/NewCondition" />
              <link
                itemProp="availability"
                href={outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'}
              />
              <meta itemProp="price" content={Math.max(0, Number(price || 0)).toFixed(2)} />

              <span
                className="text-lg font-extrabold text-brand sm:text-xl"
                aria-label={`Prix : ${formatPrice(price)}`}
              >
                {formatPrice(price)}
              </span>

              {typeof refPrice === 'number' && refPrice > price && (
                <>
                  <span
                    className="text-sm text-gray-400 line-through dark:text-gray-500"
                    aria-label="Prix de référence"
                  >
                    {formatPrice(refPrice)}
                  </span>

                  {typeof discountPct === 'number' && (
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      -{discountPct}%
                    </span>
                  )}
                </>
              )}
            </div>

            {typeof savingsEuro === 'number' && savingsEuro > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <p className="font-medium text-emerald-700 dark:text-emerald-300">
                  Vous économisez {formatPrice(savingsEuro)}
                </p>

                {typeof itemsValue === 'number' && (
                  <span className="text-token-text/60">
                    Valeur des articles : {formatPrice(itemsValue)}
                  </span>
                )}
              </div>
            )}

            <FreeShippingBadge price={price} minimal className="mt-2" />
          </div>
        </Link>
      </motion.div>

      {ariaDescribedBy && (
        <p id={srId} className="sr-only" aria-live="polite">
          {describe.join('. ')}
        </p>
      )}
    </motion.article>
  )
}