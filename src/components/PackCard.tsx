'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
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
import { BRAND } from '@/lib/constants'
import { pushDataLayer } from '@/lib/ga'
import { getCurrentLocale } from '@/lib/i18n-routing'
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

const STR = {
  fr: {
    new: 'Nouveau',
    bestSeller: 'Best Seller',
    lowStock: 'Stock faible',
    outOfStock: 'Rupture',
    included: (n: number) => `${n} article${n > 1 ? 's' : ''} inclus`,
    save: 'Vous économisez',
    itemValue: 'Valeur des articles',
    readPack: 'Découvrir le pack',
    avgRating: (v: string) => `Note moyenne : ${v} étoiles`,
    savings: (v: number) => `${v}% d’économie`,
    previewItems: 'Aperçu des articles inclus',
  },
  en: {
    new: 'New',
    bestSeller: 'Best Seller',
    lowStock: 'Low stock',
    outOfStock: 'Out of stock',
    included: (n: number) => `${n} item${n > 1 ? 's' : ''} included`,
    save: 'You save',
    itemValue: 'Items value',
    readPack: 'View pack',
    avgRating: (v: string) => `Average rating: ${v} stars`,
    savings: (v: number) => `${v}% savings`,
    previewItems: 'Preview of included items',
  },
} as const

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
  return toFiniteNumber(getFirstValue(record, keys))
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
  if (isRecord(value)) return readString(value, ['url', 'src', 'image', 'path'])
  return undefined
}

const readImageList = (record: UnknownRecord, keys: readonly string[]): string[] | undefined => {
  const value = getFirstValue(record, keys)
  if (!Array.isArray(value)) return undefined

  const images = value
    .map((entry) => normalizeImageSrc(entry))
    .filter((entry): entry is string => Boolean(entry))

  return images.length ? images : undefined
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

const SITE_URL = BRAND.URL

const toAbs = (value?: string) => {
  if (!value) return ''
  if (value.startsWith('http')) return value
  if (SITE_URL) return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`
  if (typeof window !== 'undefined') return window.location.origin + value
  return value
}

export default function PackCard({ pack, priority = false, className }: PackCardProps) {
  const pathname = usePathname() || '/'
  const locale = getCurrentLocale(pathname) === 'en' ? 'en' : 'fr'
  const t = STR[locale]
  const prefersReducedMotion = useReducedMotion()

  const {
    slug,
    title = 'Pack',
    description,
    image,
    price = 0,
    oldPrice,
  } = pack

  const packRecord: UnknownRecord = isRecord(pack) ? pack : {}

  const images = readImageList(packRecord, ['images'])
  const compareAtPrice = readNumber(packRecord, [
    'compareAtPrice',
    'compare_at_price',
    'referencePrice',
    'reference_price',
  ])

  const isNew = readBoolean(packRecord, ['isNew', 'new'])
  const isBestSeller = readBoolean(packRecord, ['isBestSeller', 'bestSeller', 'bestseller'])
  const stock = readNumber(packRecord, ['stock'])
  const items = readArray(packRecord, ['items', 'contents']) ?? []
  const rating = readNumber(packRecord, ['rating'])
  const reviewsCount = readNumber(packRecord, ['reviewsCount', 'reviews'])
  const sku = readString(packRecord, ['sku']) ?? readIdString(packRecord, ['id'])
  const brand = readString(packRecord, ['brand'])

  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  const cardRef = useRef<HTMLDivElement | null>(null)
  const viewedRef = useRef(false)
  const tickingRef = useRef(false)

  const mainImage = useMemo(() => {
    const first = images?.[0] ?? normalizeImageSrc(image)
    return imageError ? '/placeholder.png' : first || '/placeholder.png'
  }, [image, imageError, images])

  const itemsValue = useMemo(() => {
    if (!items.length) return undefined

    let sum = 0
    for (const item of items) {
      const value = readItemPrice(item)
      if (typeof value === 'number') sum += value
    }

    return sum > 0 ? sum : undefined
  }, [items])

  const referencePrice =
    typeof oldPrice === 'number' && oldPrice > price
      ? oldPrice
      : typeof compareAtPrice === 'number' && compareAtPrice > price
        ? compareAtPrice
        : typeof itemsValue === 'number' && itemsValue > price
          ? itemsValue
          : undefined

  const discountPercent = useMemo(() => {
    return typeof referencePrice === 'number' && referencePrice > price
      ? Math.round(((referencePrice - price) / referencePrice) * 100)
      : null
  }, [price, referencePrice])

  const savingsEuro = useMemo(() => {
    return typeof referencePrice === 'number' && referencePrice > price
      ? Math.max(0, referencePrice - price)
      : null
  }, [price, referencePrice])

  const urlPath = slug ? `/products/packs/${slug}` : '/products/packs'

  const lowStock = typeof stock === 'number' && stock > 0 && stock <= 5
  const outOfStock = typeof stock === 'number' && stock <= 0
  const hasRating = typeof rating === 'number' && !Number.isNaN(rating)
  const formattedRating = hasRating ? rating.toFixed(1) : null

  const itemChips = useMemo(() => {
    if (!items.length) return []

    const labels: string[] = []
    for (const item of items) {
      const label = readItemLabel(item)
      if (label) labels.push(label)
      if (labels.length >= 3) break
    }
    return labels
  }, [items])

  const srId = useId()
  const srMessages: string[] = []

  if (typeof discountPercent === 'number') srMessages.push(t.savings(discountPercent))
  if (lowStock) srMessages.push(t.lowStock)
  if (outOfStock) srMessages.push(t.outOfStock)

  const ariaDescribedBy = srMessages.length ? srId : undefined

  useEffect(() => {
    if (!cardRef.current || viewedRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || viewedRef.current) continue

          viewedRef.current = true

          try {
            logEvent({
              action: 'pack_card_view',
              category: 'engagement',
              label: title,
              value: price,
            })
          } catch {
            // no-op
          }

          try {
            pushDataLayer({
              event: 'view_pack_card',
              items: [{ item_id: slug, item_name: title, price }],
            })
          } catch {
            // no-op
          }
        }
      },
      { threshold: 0.35 }
    )

    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [price, slug, title])

  const handleClick = useCallback(() => {
    try {
      logEvent({
        action: 'pack_card_click',
        category: 'engagement',
        label: title,
        value: price,
      })
    } catch {
      // no-op
    }

    try {
      pushDataLayer({
        event: 'select_pack',
        items: [{ item_id: slug, item_name: title, price }],
      })
    } catch {
      // no-op
    }
  }, [price, slug, title])

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return

    try {
      if (window.matchMedia && !window.matchMedia('(hover:hover)').matches) return
    } catch {
      // no-op
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = event.clientX - centerX
    const dy = event.clientY - centerY
    const ry = clamp((dx / (rect.width / 2)) * 6, -8, 8)
    const rx = clamp((-dy / (rect.height / 2)) * 6, -8, 8)

    if (tickingRef.current) return

    tickingRef.current = true
    requestAnimationFrame(() => {
      setTilt({ rx, ry })
      tickingRef.current = false
    })
  }

  const resetTilt = () => setTilt({ rx: 0, ry: 0 })

  const articleStyle = useMemo<CSSProperties>(() => {
    return {
      perspective: 1000,
      background:
        'conic-gradient(from 140deg, hsl(var(--accent) / .38), transparent 35%, hsl(199 89% 48% / .22), transparent 70%, hsl(var(--accent) / .28))',
    }
  }, [])

  return (
    <motion.article
      ref={cardRef}
      itemScope
      itemType="https://schema.org/Product"
      className={cn(
        'group relative rounded-3xl p-[1px] shadow-sm transition-shadow hover:shadow-2xl',
        className
      )}
      style={articleStyle}
      whileHover={!prefersReducedMotion ? { scale: 1.015 } : undefined}
      transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: 'easeOut' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      aria-describedby={ariaDescribedBy}
      data-pack-id={slug}
    >
      <meta itemProp="name" content={title} />
      <meta itemProp="image" content={toAbs(mainImage)} />
      <meta itemProp="url" content={toAbs(urlPath)} />
      {brand ? <meta itemProp="brand" content={brand} /> : null}
      {sku ? <meta itemProp="sku" content={sku} /> : null}

      {hasRating && formattedRating ? (
        <div
          itemProp="aggregateRating"
          itemScope
          itemType="https://schema.org/AggregateRating"
          className="hidden"
        >
          <meta itemProp="ratingValue" content={formattedRating} />
          {typeof reviewsCount === 'number' ? (
            <meta itemProp="reviewCount" content={String(Math.max(0, reviewsCount))} />
          ) : null}
        </div>
      ) : null}

      <motion.div
        className={cn(
          'relative overflow-hidden rounded-[inherit] border border-white/40 bg-white/80 ring-1 ring-gray-200/60 backdrop-blur dark:border-white/10 dark:bg-zinc-900/80 dark:ring-gray-800/60'
        )}
        style={
          !prefersReducedMotion
            ? { rotateX: tilt.rx, rotateY: tilt.ry, transformStyle: 'preserve-3d' as const }
            : undefined
        }
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(700px 220px at 12% -10%, rgba(255,255,255,0.35), transparent 60%)',
          }}
        />

        <Link
          href={urlPath}
          prefetch={false}
          className="block rounded-[inherit] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.6)]"
          onClick={handleClick}
          aria-label={t.readPack}
        >
          <div
            className="relative aspect-[4/3] w-full bg-gray-100 sm:aspect-[16/9] dark:bg-zinc-800"
            aria-busy={!imageLoaded}
          >
            <Image
              src={mainImage}
              alt={title}
              fill
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              priority={priority}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              quality={85}
              decoding="async"
              draggable={false}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
            />

            {!imageLoaded ? (
              <div
                className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200/70 to-gray-100/40 dark:from-zinc-800/60 dark:to-zinc-900/40"
                aria-hidden="true"
              />
            ) : null}

            <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-2">
              {isNew ? (
                <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow">
                  {t.new}
                </span>
              ) : null}

              {isBestSeller ? (
                <span className="rounded-full bg-yellow-400 px-2.5 py-0.5 text-[11px] font-semibold text-black shadow">
                  {t.bestSeller}
                </span>
              ) : null}

              {typeof discountPercent === 'number' ? (
                <span
                  className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow"
                  aria-label={t.savings(discountPercent)}
                >
                  -{discountPercent}%
                </span>
              ) : null}

              {lowStock ? (
                <span className="rounded-full bg-amber-300/90 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 shadow">
                  {t.lowStock}
                </span>
              ) : null}
            </div>

            {hasRating && formattedRating ? (
              <div
                className="absolute right-3 top-3 rounded-full border border-gray-200/60 bg-white/90 px-2.5 py-1 text-xs shadow backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90"
                aria-label={t.avgRating(formattedRating)}
              >
                <span className="text-yellow-500">★</span> {formattedRating}
              </div>
            ) : null}

            {outOfStock ? (
              <div
                className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-semibold text-white"
                aria-hidden="true"
              >
                {t.outOfStock}
              </div>
            ) : null}

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent"
              aria-hidden="true"
            />
          </div>

          <div className="p-5 sm:p-6">
            <h3
              className="line-clamp-2 text-lg font-semibold text-gray-900 sm:text-xl dark:text-white"
              title={title}
            >
              {title}
            </h3>

            {items.length > 0 ? (
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                {t.included(items.length)}
              </p>
            ) : null}

            {itemChips.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={t.previewItems}>
                {itemChips.map((label, index) => (
                  <li
                    key={`${label}-${index}`}
                    className="rounded-md border border-token-border bg-token-surface px-2 py-1 text-[11px] text-token-text/80"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            ) : null}

            {description ? (
              <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            ) : null}

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

              {typeof referencePrice === 'number' && referencePrice > price ? (
                <>
                  <span className="text-sm text-gray-400 line-through dark:text-gray-500">
                    {formatPrice(referencePrice)}
                  </span>

                  {typeof discountPercent === 'number' ? (
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      -{discountPercent}%
                    </span>
                  ) : null}
                </>
              ) : null}
            </div>

            {typeof savingsEuro === 'number' && savingsEuro > 0 ? (
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <p className="font-medium text-emerald-700 dark:text-emerald-300">
                  {t.save} {formatPrice(savingsEuro)}
                </p>

                {typeof itemsValue === 'number' ? (
                  <span className="text-token-text/60">
                    {t.itemValue} : {formatPrice(itemsValue)}
                  </span>
                ) : null}
              </div>
            ) : null}

            <FreeShippingBadge price={price} minimal className="mt-2" />
          </div>
        </Link>
      </motion.div>

      {ariaDescribedBy ? (
        <p id={srId} className="sr-only" aria-live="polite">
          {srMessages.join('. ')}
        </p>
      ) : null}
    </motion.article>
  )
}