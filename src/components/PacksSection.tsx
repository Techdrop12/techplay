'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import PackCard from '@/components/PackCard'
import type { Pack } from '@/types/product'
import { cn } from '@/lib/utils'

interface Props {
  packs: Pack[]
  /** Classe optionnelle */
  className?: string
  /** Afficher le header interne (évite les doublons si tu as déjà un SectionHeader au-dessus) */
  showHeader?: boolean
  /** Nombre initial d’items visibles, puis “Voir plus” (0 = tous) */
  limit?: number
  /** Afficher la barre de contrôles (tri / filtres) */
  showControls?: boolean
  /** Tri initial */
  initialSort?: 'savings' | 'priceAsc' | 'priceDesc' | 'items'
  /** Activer l’autoload “voir plus” quand le sentinel entre dans le viewport */
  autoLoadOnIntersect?: boolean
}

type AnyPack = Record<string, any>

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

/* ───────────────────────────── Helpers ───────────────────────────── */

function pushDL(event: string, payload?: Record<string, unknown>) {
  try {
    ;(window as any).dataLayer?.push({ event, ...payload })
  } catch {}
}

function getPackPrice(p: AnyPack): number | undefined {
  const v = p.price ?? p.prix ?? p.amount ?? p.totalPrice
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : undefined
}

function getItems(p: AnyPack): any[] {
  const arr = p.items ?? p.products ?? p.contents ?? []
  return Array.isArray(arr) ? arr : []
}

function getItemPrice(it: Record<string, any>): number {
  const v = it.price ?? it.prix ?? it.amount
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function getSumItems(p: AnyPack): number {
  const items = getItems(p)
  return items.reduce((acc: number, it: any) => acc + getItemPrice(it || {}), 0)
}

/** % d’économie (0..100). Si impossible à calculer, 0. */
function getSavingsPercent(p: AnyPack): number {
  const packPrice = getPackPrice(p)
  const sum = getSumItems(p)
  if (!packPrice || !Number.isFinite(sum) || sum <= 0) return 0
  const raw = ((sum - packPrice) / sum) * 100
  return Math.max(0, Math.min(100, Math.round(raw)))
}

function getItemsCount(p: AnyPack): number {
  const items = getItems(p)
  return items.length
}

function isInStock(p: AnyPack): boolean {
  const s = p.stock ?? p.quantity ?? p.qty
  if (typeof s === 'number') return s > 0
  if (typeof p.available === 'boolean') return p.available
  return true
}

function isPromo(p: AnyPack): boolean {
  return getSavingsPercent(p) > 0
}

/* ─────────────────────────── Composant ─────────────────────────── */

export default function PacksSection({
  packs,
  className,
  showHeader = true,
  limit = 6,
  showControls = true,
  initialSort = 'savings',
  autoLoadOnIntersect = true,
}: Props) {
  const headingId = useId()
  const subId = headingId + '-sub'
  const gridId = headingId + '-grid'
  const liveId = headingId + '-live'
  const sortId = headingId + '-sort'

  const reduceMotion = useReducedMotion()
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const [expanded, setExpanded] = useState(false)
  const [announce, setAnnounce] = useState<string>('')
  const [sortBy, setSortBy] = useState<'savings' | 'priceAsc' | 'priceDesc' | 'items'>(initialSort)
  const [filterPromo, setFilterPromo] = useState(false)
  const [filterStock, setFilterStock] = useState(false)

  const isEmpty = !Array.isArray(packs) || packs.length === 0

  /* Fallback skeleton élégant */
  if (isEmpty) {
    return (
      <section className={cn('max-w-6xl mx-auto px-6 py-16', className)}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" aria-hidden="true" />
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-token-text/70" role="status" aria-live="polite">
          Chargement des packs recommandés…
        </p>
      </section>
    )
  }

  /* Liste filtrée + triée */
  const filteredSorted = useMemo(() => {
    let arr = packs.filter(Boolean)
    if (filterPromo) arr = arr.filter((p) => isPromo(p as AnyPack))
    if (filterStock) arr = arr.filter((p) => isInStock(p as AnyPack))

    const copy = [...arr]
    copy.sort((a, b) => {
      const pa = getPackPrice(a as AnyPack) ?? Infinity
      const pb = getPackPrice(b as AnyPack) ?? Infinity
      const sa = getSavingsPercent(a as AnyPack)
      const sb = getSavingsPercent(b as AnyPack)
      const ia = getItemsCount(a as AnyPack)
      const ib = getItemsCount(b as AnyPack)

      switch (sortBy) {
        case 'priceAsc':
          return pa - pb
        case 'priceDesc':
          return pb - pa
        case 'items':
          return ib - ia
        case 'savings':
        default:
          return sb - sa
      }
    })
    return copy
  }, [packs, filterPromo, filterStock, sortBy])

  /* Découpage “voir plus” */
  const list = useMemo(() => {
    if (!limit || expanded) return filteredSorted
    return filteredSorted.slice(0, limit)
  }, [filteredSorted, limit, expanded])

  /* SR announce quand on étend */
  useEffect(() => {
    if (!expanded) return
    const remaining = Math.max(0, filteredSorted.length - (limit || 0))
    if (remaining > 0) setAnnounce(remaining + ' packs supplémentaires affichés.')
  }, [expanded, filteredSorted.length, limit])

  /* Autoload “voir plus” si le sentinel devient visible */
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

  return (
    <section
      className={cn('max-w-6xl mx-auto px-6 py-16', className)}
      aria-labelledby={showHeader ? headingId : undefined}
      role="region"
    >
      {/* Header + CTA */}
      {showHeader && (
        <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <h2 id={headingId} className="text-3xl font-extrabold text-brand dark:text-white">
              🎁 Nos Packs Recommandés
            </h2>
            <p id={subId} className="mt-2 text-sm text-token-text/70">
              Équipez-vous malin : bundles optimisés pour la perf’ et le budget.
              <span className="sr-only"> {totalCount} packs disponibles.</span>
            </p>
          </div>

          <Link
            href="/pack"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:bg-[hsl(var(--accent)/.90)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]"
            aria-label="Voir tous les packs TechPlay"
            onClick={() => pushDL('packs_see_all')}
          >
            Voir tous les packs
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="opacity-90">
              <path fill="currentColor" d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
            </svg>
          </Link>
        </div>
      )}

      {/* Barre de contrôle (tri / filtres) */}
      {showControls && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-token-text/70">
            Affichage <span className="font-semibold">{visibleCount}</span> / <span>{totalCount}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filtres */}
            <button
              type="button"
              onClick={() => { const nv = !filterPromo; setFilterPromo(nv); pushDL('packs_filter', { promo: nv }) }}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                filterPromo
                  ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent))]'
                  : 'border-token-border bg-token-surface hover:shadow'
              )}
              aria-pressed={filterPromo}
              aria-label="Filtrer : en promotion"
            >
              Promo
            </button>

            <button
              type="button"
              onClick={() => { const nv = !filterStock; setFilterStock(nv); pushDL('packs_filter', { stock: nv }) }}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                filterStock
                  ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent))]'
                  : 'border-token-border bg-token-surface hover:shadow'
              )}
              aria-pressed={filterStock}
              aria-label="Filtrer : en stock"
            >
              En stock
            </button>

            {/* Tri */}
            <label className="sr-only" htmlFor={sortId}>Trier</label>
            <select
              id={sortId}
              className="rounded-xl border border-token-border bg-token-surface px-3 py-1.5 text-xs font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]"
              value={sortBy}
              onChange={(e) => {
                const v = (e.target.value as Props['initialSort']) || 'savings'
                setSortBy(v)
                pushDL('packs_sort', { sort: v })
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

      {/* Grid */}
      <motion.ul
        {...(!reduceMotion ? { variants: containerVariants, initial: 'hidden', whileInView: 'show' } : {})}
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3"
        role="list"
        aria-describedby={showHeader ? subId : undefined}
        id={gridId}
      >
        {list.map((pack, i) => {
          const key = (pack as any)?.slug ?? (pack as any)?._id ?? ('pk-' + i)
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

      {/* Zone d’action : Voir plus + Sentinel */}
      {!expanded && limit > 0 && totalCount > limit && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => { setExpanded(true); pushDL('packs_see_more_click') }}
            className="inline-flex items-center gap-2 rounded-full border border-token-border bg-token-surface px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]"
            aria-controls={gridId}
            aria-expanded={expanded ? 'true' : 'false'}
          >
            Voir plus
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="opacity-80">
              <path fill="currentColor" d="M7 10l5 5 5-5z" />
            </svg>
          </button>

          {autoLoadOnIntersect && (
            <div ref={sentinelRef} className="sr-only" aria-hidden="true" />
          )}
        </div>
      )}

      {/* SR live */}
      <p id={liveId} className="sr-only" aria-live="polite">{announce}</p>

      {/* Noscript fallback */}
      <noscript>
        <p className="mt-6 text-center">
          <a href="/pack">Voir tous les packs</a>
        </p>
      </noscript>
    </section>
  )
}
