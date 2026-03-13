'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import type { Pack } from '@/types/product'

import Link from '@/components/LocalizedLink'
import PackCard from '@/components/PackCard'
import { cn } from '@/lib/utils'

interface Props {
  packs: Pack[]
  className?: string
  showHeader?: boolean
  limit?: number
  showControls?: boolean
  initialSort?: 'savings' | 'priceAsc' | 'priceDesc' | 'items'
  autoLoadOnIntersect?: boolean
  /** Optional copy for empty state (defaults to French) */
  emptyTitle?: string
  emptyDescription?: string
  emptyCtaLabel?: string
  emptyCtaHref?: string
}

type PackRecord = Record<string, unknown>

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

function getItems(pack: Pack): PackRecord[] {
  const record = toRecord(pack)
  const raw = record.items ?? record.products ?? record.contents
  return Array.isArray(raw) ? raw.map((item) => toRecord(item)) : []
}

function getItemPrice(item: PackRecord): number {
  return readNumber(item, ['price', 'prix', 'amount']) ?? 0
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

const EMPTY_DEFAULTS = {
  title: 'Packs bientôt disponibles',
  description: 'Nous préparons des bundles soignés pour vous. En attendant, découvrez notre sélection de produits.',
  ctaLabel: 'Découvrir les produits',
  ctaHref: '/products',
} as const

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

  const isEmpty = !Array.isArray(packs) || packs.length === 0

  if (isEmpty) {
    const title = emptyTitle ?? EMPTY_DEFAULTS.title
    const description = emptyDescription ?? EMPTY_DEFAULTS.description
    const ctaLabel = emptyCtaLabel ?? EMPTY_DEFAULTS.ctaLabel
    const ctaHref = emptyCtaHref ?? EMPTY_DEFAULTS.ctaHref

    return (
      <section
        className={cn('container-app mx-auto py-10 sm:py-12', className)}
        aria-labelledby={showHeader ? headingId : undefined}
        role="region"
      >
        {showHeader && (
          <div className="mb-10 flex flex-col items-center text-center sm:mb-12">
            <h2
              id={headingId}
              className="flex items-center justify-center gap-2 heading-subsection font-bold sm:text-2xl"
            >
              <DuotoneGift size={24} className="text-[hsl(var(--accent))]" />
              <span>Nos Packs Recommandés</span>
            </h2>
            <p id={subId} className="mt-2 text-sm text-token-text/70">
              Équipez-vous malin : bundles optimisés pour la perf’ et le budget.
            </p>
          </div>
        )}

        <div
          className="mx-auto max-w-xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding text-center shadow-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.08)] text-[hsl(var(--accent))]">
              <DuotoneGift size={32} />
            </span>
          </div>
          <h3 className="mt-6 text-xl font-bold tracking-tight text-[hsl(var(--text))] sm:text-2xl">
            {title}
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-token-text/70">
            {description}
          </p>
          <div className="rhythm-content">
            <Link
              href={ctaHref}
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[hsl(var(--accent)/0.9)] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
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
    if (remaining > 0) setAnnounce(`${remaining} packs supplémentaires affichés.`)
  }, [expanded, filteredSorted.length, limit])

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

  const totalCount = filteredSorted.length
  const visibleCount = list.length
  const hasPacks = totalCount > 0
  const filterActive = filterPromo || filterStock
  const noResultsAfterFilter = hasPacks && filterActive && visibleCount === 0

  return (
    <section
      className={cn('container-app mx-auto py-10 sm:py-12', className)}
      aria-labelledby={showHeader ? headingId : undefined}
      role="region"
    >
      {showHeader && (
        <>
          <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-center sm:text-left">
              <h2
                id={headingId}
                className="flex items-center justify-center gap-2 heading-subsection font-bold sm:justify-start"
              >
                <DuotoneGift size={22} className="text-[hsl(var(--accent))]" />
                <span>Nos Packs Recommandés</span>
              </h2>
              <p id={subId} className="mt-2 text-sm text-token-text/70">
                Équipez-vous malin : bundles optimisés pour la perf’ et le budget.
                {hasPacks && <span className="sr-only"> {totalCount} packs disponibles.</span>}
              </p>
            </div>

            <Link
              href="/products/packs"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[hsl(var(--accent)/.90)] hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]"
              aria-label="Voir tous les packs TechPlay"
              onClick={() => pushDL('packs_see_all')}
            >
              Voir tous les packs
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="opacity-90">
                <path fill="currentColor" d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
              </svg>
            </Link>
          </div>

          {hasPacks && (
            <div className="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[12px] text-token-text/65 sm:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" />
                Sélectionnés par nos experts
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                Économies sur les bundles
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                Livraison offerte
              </span>
            </div>
          )}
        </>
      )}

      {hasPacks && showControls && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-token-text/70">
            Affichage <span className="font-semibold">{visibleCount}</span> / <span>{totalCount}</span>
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
              aria-label="Filtrer : en promotion"
            >
              Promo
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
              aria-label="Filtrer : en stock"
            >
              En stock
            </button>

            <label className="sr-only" htmlFor={sortId}>
              Trier
            </label>

            <select
              id={sortId}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-[12px] font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]"
              value={sortBy}
              onChange={(e) => {
                const next = (e.target.value as Props['initialSort']) || 'savings'
                setSortBy(next)
                pushDL('packs_sort', { sort: next })
              }}
              aria-label="Trier les packs"
            >
              <option value="savings">Économie %</option>
              <option value="priceAsc">Prix ↑</option>
              <option value="priceDesc">Prix ↓</option>
              <option value="items">Nb d’articles</option>
            </select>
          </div>
        </div>
      )}

      {noResultsAfterFilter ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/60 card-padding text-center">
          <p className="text-sm font-medium text-token-text/80">
            Aucun pack ne correspond aux filtres sélectionnés.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilterPromo(false)
              setFilterStock(false)
              pushDL('packs_filter_clear')
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-[13px] font-semibold transition hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <motion.ul
          {...(!reduceMotion ? { variants: containerVariants, initial: 'hidden', whileInView: 'show' } : {})}
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 sm:gap-8"
          role="list"
          aria-describedby={showHeader ? subId : undefined}
          id={gridId}
        >
          {list.map((pack, i) => {
            const record = toRecord(pack)
            const key = readString(record, ['slug', '_id', 'id']) ?? `pk-${i}`

            return (
              <motion.li
                key={key}
                {...(!reduceMotion ? { variants: itemVariants } : {})}
                {...(!reduceMotion ? { whileHover: { y: -4 } } : {})}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                data-gtm="packs_item"
                data-idx={i}
              >
                <PackCard pack={pack} />
              </motion.li>
            )
          })}
        </motion.ul>
      )}

      {hasPacks && !noResultsAfterFilter && (
        <div className="mt-8 flex items-center justify-between gap-4">
          <Link
            href="/products/packs"
            prefetch={false}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-600))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
          >
            <span>Voir tous les packs</span>
            <span aria-hidden>↗</span>
          </Link>

          <p className="text-xs text-token-text/60">
            {visibleCount} / {totalCount} packs affichés
          </p>
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
            className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-2.5 text-[13px] font-semibold shadow-sm transition hover:shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]"
            aria-controls={gridId}
            aria-expanded={expanded ? 'true' : 'false'}
          >
            Voir plus
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
          <a href="/products/packs">Voir tous les packs</a>
        </p>
      </noscript>
    </section>
  )
}