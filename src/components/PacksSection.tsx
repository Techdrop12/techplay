'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import type { Pack } from '@/types/product'

import Link from '@/components/LocalizedLink'
import { getCurrentLocale } from '@/lib/i18n-routing'
import { safeProductImageUrl } from '@/lib/safeProductImage'
import { cn, formatPrice } from '@/lib/utils'

interface Props {
  packs: Pack[]
  className?: string
  showHeader?: boolean
  limit?: number
  showControls?: boolean
  initialSort?: 'savings' | 'priceAsc' | 'priceDesc' | 'items'
  autoLoadOnIntersect?: boolean
  /** Optional copy for empty state (overrides locale-aware defaults) */
  emptyTitle?: string
  emptyDescription?: string
  emptyCtaLabel?: string
  emptyCtaHref?: string
}

type PackRecord = Record<string, unknown>

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYikiIGZpbGw9IiNlZWUiIC8+PC9zdmc+'

function DuotoneGift({
  size = 18,
  className = 'text-[hsl(var(--accent))]',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M20 7h-3.17a3 3 0 1 0-5.66-2 3 3 0 1 0-5.66 2H2v4h2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9h2V7h-2Zm-9-2a1 1 0 1 1 0 2H8a1 1 0 0 1 0-2h3Zm-5 6h5v9H6v-9Zm7 9v-9h5v9h-5Z"
        fill="currentColor"
        className="opacity-90"
      />
      <path
        d="M20 7h-3.17a3 3 0 1 0-5.66-2 3 3 0 1 0-5.66 2H2v4h2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9h2V7h-2Zm-9-2a1 1 0 1 1 0 2H8a1 1 0 0 1 0-2h3Zm-5 6h5v9H6v-9Zm7 9v-9h5v9h-5Z"
        fill="currentColor"
        className="opacity-25 blur-[1px]"
      />
    </svg>
  )
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
      when: 'beforeChildren',
      staggerChildren: 0.06,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

function isRecord(value: unknown): value is PackRecord {
  return typeof value === 'object' && value !== null
}

function toRecord(value: unknown): PackRecord {
  return isRecord(value) ? value : {}
}

function readString(record: PackRecord, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return undefined
}

function readNumber(record: PackRecord, keys: readonly string[]): number | undefined {
  for (const key of keys) {
    const value = record[key]
    const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

function readBoolean(record: PackRecord, keys: readonly string[]): boolean | undefined {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'boolean') return value
  }
  return undefined
}

function pushDL(event: string, payload?: Record<string, unknown>) {
  try {
    if (!Array.isArray(window.dataLayer)) window.dataLayer = []
    window.dataLayer.push({ event, ...(payload ?? {}) })
  } catch {}
}

function getPackPrice(pack: Pack): number | undefined {
  const record = toRecord(pack)
  return readNumber(record, ['price', 'prix', 'amount', 'totalPrice'])
}

function getPackTitle(pack: Pack): string {
  const record = toRecord(pack)
  return readString(record, ['title', 'name', 'label']) ?? 'Pack'
}

function getPackSlug(pack: Pack): string | undefined {
  const record = toRecord(pack)
  const slug = readString(record, ['slug'])
  if (slug) return slug
  const id = record._id ?? record.id
  if (typeof id === 'string') return id
  if (typeof id === 'number') return String(id)
  return undefined
}

function getPackImage(pack: Pack): string {
  const record = toRecord(pack)
  const single = readString(record, ['image', 'img', 'cover'])
  if (single) return safeProductImageUrl(single)
  const raw = record.images ?? record.gallery
  if (Array.isArray(raw) && typeof raw[0] === 'string' && raw[0].trim())
    return safeProductImageUrl(raw[0])
  return '/og-image.jpg'
}

function getItems(pack: Pack): PackRecord[] {
  const record = toRecord(pack)
  const raw = record.items ?? record.products ?? record.contents
  return Array.isArray(raw) ? raw.map((item) => toRecord(item)) : []
}

function getItemPrice(item: PackRecord): number {
  return readNumber(item, ['price', 'prix', 'amount']) ?? 0
}

function getItemLabel(item: PackRecord): string | undefined {
  return readString(item, ['title', 'name', 'label'])
}

function getSumItems(pack: Pack): number {
  return getItems(pack).reduce((acc, item) => acc + getItemPrice(item), 0)
}

function getSavingsPercent(pack: Pack): number {
  const packPrice = getPackPrice(pack)
  const sum = getSumItems(pack)
  if (!packPrice || !Number.isFinite(sum) || sum <= 0) return 0
  const raw = ((sum - packPrice) / sum) * 100
  return Math.max(0, Math.min(100, Math.round(raw)))
}

function getItemsCount(pack: Pack): number {
  return getItems(pack).length
}

function isInStock(pack: Pack): boolean {
  const record = toRecord(pack)
  const stock = readNumber(record, ['stock', 'quantity', 'qty'])
  const available = readBoolean(record, ['available'])

  if (typeof stock === 'number') return stock > 0
  if (typeof available === 'boolean') return available
  return true
}

function isPromo(pack: Pack): boolean {
  return getSavingsPercent(pack) > 0
}

export default function PacksSection({
  packs,
  className,
  showHeader = true,
  limit = 6,
  showControls = true,
  initialSort = 'savings',
  autoLoadOnIntersect = true,
  emptyTitle,
  emptyDescription,
  emptyCtaLabel,
  emptyCtaHref,
}: Props) {
  const pathname = usePathname() || '/'
  const locale = getCurrentLocale(pathname) === 'en' ? 'en' : 'fr'

  const t = useMemo(() => {
    if (locale === 'en') {
      return {
        heading: 'Recommended',
        headingAccent: 'Bundles',
        sub: 'Expert picks: multiple products together at bundle price. Save more, free delivery.',
        seeAll: 'View all bundles',
        seeAllAria: 'View all TechPlay bundles',
        bulletExpert: 'Selected by our experts',
        bulletSavings: 'Savings on bundles',
        bulletShipping: 'Free delivery',
        packsLabel: 'bundles',
        packsAvailable: (n: number) => `${n} bundles available.`,
        filterPromo: 'On sale',
        filterPromoAria: 'Filter: on sale',
        filterStock: 'In stock',
        filterStockAria: 'Filter: in stock',
        sortLabel: 'Sort bundles',
        sortSavings: 'Savings %',
        sortPriceAsc: 'Price ↑',
        sortPriceDesc: 'Price ↓',
        sortItems: 'Item count',
        noResults: 'No bundles match the selected filters.',
        resetFilters: 'Reset filters',
        displayed: (visible: number, total: number) => `${visible} / ${total} bundles displayed`,
        seeMore: 'Show more',
        moreShown: (n: number) => `${n} additional bundles displayed.`,
        emptyTitle: 'Bundles coming soon',
        emptyDescription:
          'Curated bundles are coming soon. Discover our product selection in the meantime.',
        emptyCtaLabel: 'Discover products',
        noscript: 'View all bundles',
        viewPack: 'View bundle',
        savePercent: (x: number) => `Save ${x}%`,
        included: (n: number) => `${n} item${n > 1 ? 's' : ''} included`,
      }
    }
    return {
      heading: 'Recommandés',
      headingAccent: 'Packs',
      sub: 'Sélections expertes : plusieurs produits ensemble à prix pack. Économisez plus, livraison offerte.',
      seeAll: 'Voir tous les packs',
      seeAllAria: 'Voir tous les packs TechPlay',
      bulletExpert: 'Sélectionnés par nos experts',
      bulletSavings: 'Économies sur les bundles',
      bulletShipping: 'Livraison offerte',
      packsLabel: 'packs',
      packsAvailable: (n: number) => `${n} packs disponibles.`,
      filterPromo: 'Promo',
      filterPromoAria: 'Filtrer : en promotion',
      filterStock: 'En stock',
      filterStockAria: 'Filtrer : en stock',
      sortLabel: 'Trier les packs',
      sortSavings: 'Économie %',
      sortPriceAsc: 'Prix ↑',
      sortPriceDesc: 'Prix ↓',
      sortItems: "Nb d'articles",
      noResults: 'Aucun pack ne correspond aux filtres sélectionnés.',
      resetFilters: 'Réinitialiser les filtres',
      displayed: (visible: number, total: number) => `${visible} / ${total} packs affichés`,
      seeMore: 'Voir plus',
      moreShown: (n: number) => `${n} packs supplémentaires affichés.`,
      emptyTitle: 'Packs bientôt disponibles',
      emptyDescription:
        'Des bundles soignés arrivent bientôt. Découvrez notre sélection de produits en attendant.',
      emptyCtaLabel: 'Découvrir les produits',
      noscript: 'Voir tous les packs',
      viewPack: 'Voir le pack',
      savePercent: (x: number) => `Économisez ${x}%`,
      included: (n: number) => `${n} article${n > 1 ? 's' : ''} inclus`,
    }
  }, [locale])

  const headingId = useId()
  const subId = `${headingId}-sub`
  const gridId = `${headingId}-grid`
  const liveId = `${headingId}-live`
  const sortId = `${headingId}-sort`

  const reduceMotion = useReducedMotion()
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const [expanded, setExpanded] = useState(false)
  const [announce, setAnnounce] = useState('')
  const [sortBy, setSortBy] = useState<'savings' | 'priceAsc' | 'priceDesc' | 'items'>(initialSort)
  const [filterPromo, setFilterPromo] = useState(false)
  const [filterStock, setFilterStock] = useState(false)

  const filteredSorted = useMemo(() => {
    let arr = packs.filter(Boolean)
    if (filterPromo) arr = arr.filter(isPromo)
    if (filterStock) arr = arr.filter(isInStock)
    const copy = [...arr]
    copy.sort((a, b) => {
      const priceA = getPackPrice(a) ?? Infinity
      const priceB = getPackPrice(b) ?? Infinity
      const savingsA = getSavingsPercent(a)
      const savingsB = getSavingsPercent(b)
      const itemsA = getItemsCount(a)
      const itemsB = getItemsCount(b)
      switch (sortBy) {
        case 'priceAsc':
          return priceA - priceB
        case 'priceDesc':
          return priceB - priceA
        case 'items':
          return itemsB - itemsA
        case 'savings':
        default:
          return savingsB - savingsA
      }
    })
    return copy
  }, [packs, filterPromo, filterStock, sortBy])

  const list = useMemo(() => {
    if (!limit || expanded) return filteredSorted
    return filteredSorted.slice(0, limit)
  }, [filteredSorted, limit, expanded])

  useEffect(() => {
    if (!expanded) return
    const remaining = Math.max(0, filteredSorted.length - (limit || 0))
    if (remaining > 0) setAnnounce(t.moreShown(remaining))
  }, [expanded, filteredSorted.length, limit, t])

  useEffect(() => {
    if (!autoLoadOnIntersect || expanded) return
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setExpanded(true)
          pushDL('packs_autoload')
        }
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [autoLoadOnIntersect, expanded])

  const isEmpty = !Array.isArray(packs) || packs.length === 0

  if (isEmpty) {
    const title = emptyTitle ?? t.emptyTitle
    const description = emptyDescription ?? t.emptyDescription
    const ctaLabel = emptyCtaLabel ?? t.emptyCtaLabel
    const ctaHref = emptyCtaHref ?? '/products'

    return (
      <section
        className={cn('container-app mx-auto py-12 sm:py-16', className)}
        aria-labelledby={showHeader ? headingId : undefined}
        role="region"
      >
        {showHeader && (
          <div className="mb-10 flex flex-col items-center text-center sm:mb-12">
            <h2
              id={headingId}
              className="flex flex-wrap items-center justify-center gap-2 text-2xl font-extrabold tracking-tight text-[hsl(var(--text))] sm:text-3xl md:text-4xl"
            >
              <DuotoneGift size={28} className="text-[hsl(var(--accent))]" />
              <span>{t.heading}</span>
              <span className="bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent)/0.8)] bg-clip-text text-transparent">
                {t.headingAccent}
              </span>
            </h2>
            <p id={subId} className="mt-3 text-base text-[hsl(var(--text))]/70 sm:text-[15px]">
              {t.sub}
            </p>
          </div>
        )}

        <div
          className="mx-auto max-w-lg rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--surface))] to-[hsl(var(--surface-2))]/50 p-8 text-center shadow-[0_8px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          role="status"
          aria-live="polite"
        >
          <div className="flex justify-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] shadow-inner">
              <DuotoneGift size={40} />
            </span>
          </div>
          <h3 className="mt-6 text-xl font-bold tracking-tight text-[hsl(var(--text))] sm:text-2xl">
            {title}
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-[hsl(var(--text))]/70">
            {description}
          </p>
          <div className="mt-8">
            <Link
              href={ctaHref}
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-6 py-3.5 text-sm font-semibold text-[hsl(var(--accent-foreground))] shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-[hsl(var(--accent)/0.3)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/0.5)] focus-visible:ring-offset-2"
              onClick={() => pushDL('packs_empty_cta')}
            >
              {ctaLabel}
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="opacity-90">
                <path fill="currentColor" d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const totalCount = filteredSorted.length
  const visibleCount = list.length
  const hasPacks = totalCount > 0
  const filterActive = filterPromo || filterStock
  const noResultsAfterFilter = hasPacks && filterActive && visibleCount === 0

  return (
    <section
      className={cn('container-app mx-auto py-12 sm:py-16', className)}
      aria-labelledby={showHeader ? headingId : undefined}
      role="region"
    >
      {showHeader && (
        <>
          <div className="mb-8 flex flex-col items-center justify-between gap-5 sm:flex-row sm:mb-10">
            <div className="text-center sm:text-left">
              <h2
                id={headingId}
                className="flex flex-wrap items-center gap-2 text-2xl font-extrabold tracking-tight text-[hsl(var(--text))] sm:justify-start sm:text-3xl md:text-4xl"
              >
                <DuotoneGift size={26} className="shrink-0 text-[hsl(var(--accent))]" />
                <span>{t.heading}</span>
                <span className="bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent)/0.8)] bg-clip-text text-transparent">
                  {t.headingAccent}
                </span>
              </h2>
              <p id={subId} className="mt-3 text-base text-[hsl(var(--text))]/70 sm:text-[15px]">
                {t.sub}
                {hasPacks && <span className="sr-only"> {t.packsAvailable(totalCount)}</span>}
              </p>
            </div>

            <Link
              href="/products/packs"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-5 py-3 text-sm font-semibold text-[hsl(var(--accent-foreground))] shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/0.4)]"
              aria-label={t.seeAllAria}
              onClick={() => pushDL('packs_see_all')}
            >
              {t.seeAll}
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="opacity-90">
                <path fill="currentColor" d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
              </svg>
            </Link>
          </div>

          {hasPacks && (
            <div className="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-[13px] text-[hsl(var(--text))]/65 sm:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" />
                {t.bulletExpert}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                {t.bulletSavings}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                {t.bulletShipping}
              </span>
            </div>
          )}
        </>
      )}

      {hasPacks && showControls && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[hsl(var(--text))]/70">
            <span className="font-semibold tabular-nums">{visibleCount}</span>
            <span className="mx-1">/</span>
            <span className="tabular-nums">{totalCount}</span>
            <span className="ml-1">{t.packsLabel}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = !filterPromo
                setFilterPromo(next)
                pushDL('packs_filter', { promo: next })
              }}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                filterPromo
                  ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent))]'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:shadow'
              )}
              aria-pressed={filterPromo}
              aria-label={t.filterPromoAria}
            >
              {t.filterPromo}
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !filterStock
                setFilterStock(next)
                pushDL('packs_filter', { stock: next })
              }}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                filterStock
                  ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent))]'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:shadow'
              )}
              aria-pressed={filterStock}
              aria-label={t.filterStockAria}
            >
              {t.filterStock}
            </button>

            <label className="sr-only" htmlFor={sortId}>
              {t.sortLabel}
            </label>
            <select
              id={sortId}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-[12px] font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/0.3)]"
              value={sortBy}
              onChange={(e) => {
                const next = (e.target.value as Props['initialSort']) || 'savings'
                setSortBy(next)
                pushDL('packs_sort', { sort: next })
              }}
              aria-label={t.sortLabel}
            >
              <option value="savings">{t.sortSavings}</option>
              <option value="priceAsc">{t.sortPriceAsc}</option>
              <option value="priceDesc">{t.sortPriceDesc}</option>
              <option value="items">{t.sortItems}</option>
            </select>
          </div>
        </div>
      )}

      {noResultsAfterFilter ? (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/60 p-8 text-center">
          <p className="text-sm font-medium text-[hsl(var(--text))]/80">{t.noResults}</p>
          <button
            type="button"
            onClick={() => {
              setFilterPromo(false)
              setFilterStock(false)
              pushDL('packs_filter_clear')
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[13px] font-semibold transition hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            {t.resetFilters}
          </button>
        </div>
      ) : (
        <motion.ul
          {...(!reduceMotion ? { variants: containerVariants, initial: 'hidden', whileInView: 'show' } : {})}
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-8"
          role="list"
          aria-describedby={showHeader ? subId : undefined}
          id={gridId}
        >
          {list.map((pack, i) => {
            const record = toRecord(pack)
            const key = readString(record, ['slug', '_id', 'id']) ?? `pk-${i}`
            const slug = getPackSlug(pack)
            const packHref = slug ? `/products/packs/${slug}` : '/products/packs'
            const title = getPackTitle(pack)
            const packPrice = getPackPrice(pack) ?? 0
            const sumBefore = getSumItems(pack)
            const savingsPct = getSavingsPercent(pack)
            const items = getItems(pack)
            const itemLabels = items.slice(0, 4).map(getItemLabel).filter(Boolean) as string[]
            const packImage = getPackImage(pack)

            return (
              <motion.li
                key={key}
                {...(!reduceMotion ? { variants: itemVariants } : {})}
                className="group list-none"
                data-gtm="packs_item"
                data-idx={i}
              >
                <div
                  className={cn(
                    'relative overflow-hidden rounded-2xl border border-[hsl(var(--border))]/80 p-[1px]',
                    'bg-gradient-to-b from-white/40 via-white/5 to-transparent dark:from-white/10 dark:to-transparent',
                    'shadow-[0_4px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]',
                    'transition-all duration-300 ease-[var(--ease-smooth)]',
                    'hover:shadow-[0_12px_40px_rgba(15,23,42,0.12),0_0_0_1px_hsl(var(--accent)/0.2)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]',
                    'hover:border-[hsl(var(--accent)/0.3)] hover:-translate-y-0.5'
                  )}
                >
                  <div className="relative overflow-hidden rounded-[15px] border border-[hsl(var(--border))]/60 bg-[hsl(var(--surface))]/98 dark:bg-[hsl(var(--surface))]/95">
                    <Link
                      href={packHref}
                      prefetch={false}
                      className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
                      onClick={() => pushDL('packs_card_click', { slug: key })}
                    >
                      {/* Large bundle image */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[14px] bg-[hsl(var(--surface-2))] sm:aspect-[5/3]">
                        <Image
                          src={packImage}
                          alt={title}
                          fill
                          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 ease-[var(--ease-smooth)] group-hover:scale-105"
                          placeholder="blur"
                          blurDataURL={BLUR_DATA_URL}
                          quality={88}
                          draggable={false}
                        />
                        <div
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                          aria-hidden="true"
                        />
                        {savingsPct > 0 && (
                          <span className="absolute right-3 top-3 rounded-lg bg-red-500/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                            -{savingsPct}%
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-4 p-5 sm:p-6">
                        <h3
                          className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-[hsl(var(--text))] sm:text-xl"
                          title={title}
                        >
                          {title}
                        </h3>

                        {/* Included products preview */}
                        {itemLabels.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--text))]/60">
                              {t.included(items.length)}
                            </span>
                            <ul className="flex flex-wrap gap-1.5" aria-hidden="true">
                              {itemLabels.map((label, idx) => (
                                <li
                                  key={`${label}-${idx}`}
                                  className="rounded-lg bg-[hsl(var(--accent)/0.08)] px-2.5 py-1 text-[12px] font-medium text-[hsl(var(--accent))]"
                                >
                                  {label}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Price before / price pack */}
                        <div className="flex flex-wrap items-baseline gap-2">
                          {sumBefore > packPrice && (
                            <span className="text-sm font-medium text-[hsl(var(--text))]/50 line-through">
                              {formatPrice(sumBefore)}
                            </span>
                          )}
                          <span className="text-xl font-extrabold tabular-nums tracking-tight text-[hsl(var(--accent))] sm:text-2xl">
                            {formatPrice(packPrice)}
                          </span>
                        </div>

                        {/* Secondary: savings label */}
                        {savingsPct > 0 && (
                          <p className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {t.savePercent(savingsPct)}
                          </p>
                        )}

                        {/* Primary CTA */}
                        <span
                          className={cn(
                            'mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-5 py-3.5 text-sm font-semibold text-[hsl(var(--accent-foreground))]',
                            'transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-[hsl(var(--accent)/0.35)]',
                            'focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.5)] focus-visible:ring-offset-2'
                          )}
                        >
                          {t.viewPack}
                          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="currentColor" d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              </motion.li>
            )
          })}
        </motion.ul>
      )}

      {hasPacks && !noResultsAfterFilter && (
        <div className="mt-10 flex items-center justify-between gap-4">
          <Link
            href="/products/packs"
            prefetch={false}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          >
            <span>{t.seeAll}</span>
            <span aria-hidden>↗</span>
          </Link>
          <p className="text-xs text-[hsl(var(--text))]/60">{t.displayed(visibleCount, totalCount)}</p>
        </div>
      )}

      {hasPacks && !noResultsAfterFilter && !expanded && limit > 0 && totalCount > limit && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setExpanded(true)
              pushDL('packs_see_more_click')
            }}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-3 text-[13px] font-semibold shadow-sm transition-all hover:shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/0.4)]"
            aria-controls={gridId}
            aria-expanded={expanded}
          >
            {t.seeMore}
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="opacity-80">
              <path fill="currentColor" d="M7 10l5 5 5-5z" />
            </svg>
          </button>
          {autoLoadOnIntersect && <div ref={sentinelRef} className="sr-only" aria-hidden="true" />}
        </div>
      )}

      <p id={liveId} className="sr-only" aria-live="polite">
        {announce}
      </p>

      <noscript>
        <p className="mt-6 text-center">
          <a href="/products/packs">{t.noscript}</a>
        </p>
      </noscript>
    </section>
  )
}
