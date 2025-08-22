'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Product } from '@/types/product'
import ProductCard from '@/components/ProductCard'
import { cn } from '@/lib/utils'

interface BestProductsProps {
  products: Product[]
  /** Affiche le titre interne (par défaut: false pour éviter les doublons) */
  showTitle?: boolean
  /** Titre personnalisé si showTitle=true */
  title?: string
  /** Nombre initial d’articles visibles, puis bouton “Voir plus” (0 = tous) */
  limit?: number
  /** Classe optionnelle sur le wrapper */
  className?: string

  /** Afficher la barre de contrôles (tri / filtres) */
  showControls?: boolean
  /** Tri initial */
  initialSort?: 'popular' | 'priceAsc' | 'priceDesc' | 'rating'
  /** Activer l’autoload “voir plus” quand le sentinel entre dans le viewport */
  autoLoadOnIntersect?: boolean
}

type AnyProduct = Record<string, any>

/* ───────────────────────────── Helpers ───────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.06 },
  },
}
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } },
}

function pushDL(event: string, payload?: Record<string, unknown>) {
  try {
    ;(window as any).dataLayer?.push({ event, ...payload })
  } catch {}
}

function getPrice(p: AnyProduct): number | undefined {
  const v = p.price ?? p.prix ?? p.amount
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : undefined
}
function getCompareAt(p: AnyProduct): number | undefined {
  const v = p.compareAtPrice ?? p.oldPrice ?? p.originalPrice
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : undefined
}
function getRating(p: AnyProduct): number {
  const v = p.rating ?? p.note
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}
function isPromo(p: AnyProduct): boolean {
  const price = getPrice(p)
  const cmp = getCompareAt(p)
  return typeof price === 'number' && typeof cmp === 'number' && cmp > price
}
function isInStock(p: AnyProduct): boolean {
  const s = p.stock ?? p.quantity ?? p.qty
  if (typeof s === 'number') return s > 0
  if (typeof p.available === 'boolean') return p.available
  return true // par défaut optimiste
}

/* ─────────────────────────── Composant ─────────────────────────── */

export default function BestProducts({
  products,
  showTitle = false,
  title = '⭐ Nos Meilleures Ventes',
  limit = 8,
  className,
  showControls = true,
  initialSort = 'popular',
  autoLoadOnIntersect = true,
}: BestProductsProps) {
  const headingId = useId()
  const subId = headingId + '-sub'
  const gridId = headingId + '-grid'
  const liveId = headingId + '-live'

  const [expanded, setExpanded] = useState(false)
  const [announce, setAnnounce] = useState<string>('')
  const [sortBy, setSortBy] = useState<'popular' | 'priceAsc' | 'priceDesc' | 'rating'>(initialSort)
  const [filterPromo, setFilterPromo] = useState(false)
  const [filterStock, setFilterStock] = useState(false)

  const reduceMotion = useReducedMotion()
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const isEmpty = !Array.isArray(products) || products.length === 0

  // Liste filtrée/triée (stable et robuste sur n’importe quel shape)
  const filteredSorted = useMemo(() => {
    if (!Array.isArray(products)) return []

    let arr = products.filter(Boolean)
    if (filterPromo) arr = arr.filter((p) => isPromo(p as AnyProduct))
    if (filterStock) arr = arr.filter((p) => isInStock(p as AnyProduct))

    // tri
    const copy = [...arr]
    copy.sort((a, b) => {
      const pa = getPrice(a as AnyProduct) ?? Infinity
      const pb = getPrice(b as AnyProduct) ?? Infinity
      const ra = getRating(a as AnyProduct)
      const rb = getRating(b as AnyProduct)

      switch (sortBy) {
        case 'priceAsc':
          return pa - pb
        case 'priceDesc':
          return pb - pa
        case 'rating':
          return rb - ra
        case 'popular':
        default: {
          const sa = (a as AnyProduct).sales ?? (a as AnyProduct).sold ?? 0
          const sb = (b as AnyProduct).sales ?? (b as AnyProduct).sold ?? 0
          return (sb as number) - (sa as number)
        }
      }
    })
    return copy
  }, [products, sortBy, filterPromo, filterStock])

  // Liste affichée avec “voir plus”
  const list = useMemo(() => {
    if (!limit || expanded) return filteredSorted
    return filteredSorted.slice(0, limit)
  }, [filteredSorted, limit, expanded])

  // SR announce quand on étend
  useEffect(() => {
    if (!expanded) return
    const remaining = Math.max(0, filteredSorted.length - (limit || 0))
    if (remaining > 0) setAnnounce(remaining + ' produits supplémentaires affichés.')
  }, [expanded, filteredSorted.length, limit])

  // Autoload "voir plus" si le sentinel devient visible
  useEffect(() => {
    if (!autoLoadOnIntersect || expanded) return
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setExpanded(true)
          pushDL('best_products_autoload')
        }
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [autoLoadOnIntersect, expanded])

  if (isEmpty) {
    // Fallback skeleton élégant
    return (
      <section className={cn('max-w-6xl mx-auto px-4 py-10', className)}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-44 rounded-2xl" aria-hidden="true" />
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-token-text/70" role="status" aria-live="polite">
          Chargement des meilleures ventes…
        </p>
      </section>
    )
  }

  // Compteurs
  const totalCount = filteredSorted.length
  const visibleCount = list.length

  return (
    <section
      className={cn('max-w-6xl mx-auto px-4 py-10', className)}
      aria-labelledby={showTitle ? headingId : undefined}
      role="region"
    >
      {showTitle && (
        <>
          <h2
            id={headingId}
            className="mb-2 text-center text-3xl font-extrabold sm:text-4xl text-brand dark:text-white"
          >
            {title}
          </h2>
          <p id={subId} className="mb-6 text-center text-sm text-token-text/70">
            Les favoris de la communauté — stock limité.
            <span className="sr-only"> {totalCount} produits disponibles.</span>
          </p>
        </>
      )}

      {/* Barre de contrôle (tri / filtres) */}
      {showControls && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-token-text/70">
            Affichage&nbsp;
            <span className="font-semibold">{visibleCount}</span>
            &nbsp;/&nbsp;
            <span>{totalCount}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filtres */}
            <button
              type="button"
              onClick={() => { setFilterPromo((v) => !v); pushDL('best_products_filter', { promo: !filterPromo }) }}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                filterPromo
                  ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent))]'
                  : 'border-token-border bg-token-surface hover:shadow'
              )}
              aria-pressed={filterPromo}
              aria-label="Filtrer: en promotion"
            >
              Promo
            </button>

            <button
              type="button"
              onClick={() => { setFilterStock((v) => !v); pushDL('best_products_filter', { stock: !filterStock }) }}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                filterStock
                  ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent))]'
                  : 'border-token-border bg-token-surface hover:shadow'
              )}
              aria-pressed={filterStock}
              aria-label="Filtrer: en stock"
            >
              En stock
            </button>

            {/* Tri */}
            <label className="sr-only" htmlFor={headingId + '-sort'}>Trier</label>
            <select
              id={headingId + '-sort'}
              className="rounded-xl border border-token-border bg-token-surface px-3 py-1.5 text-xs font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]"
              value={sortBy}
              onChange={(e) => {
                const v = e.target.value as BestProductsProps['initialSort']
                setSortBy(v || 'popular')
                pushDL('best_products_sort', { sort: v })
              }}
              aria-label="Trier les produits"
            >
              <option value="popular">Popularité</option>
              <option value="priceAsc">Prix ↑</option>
              <option value="priceDesc">Prix ↓</option>
              <option value="rating">Note</option>
            </select>
          </div>
        </div>
      )}

      {/* Grille */}
      <motion.ul
        {...(!reduceMotion ? { variants: containerVariants, initial: 'hidden', whileInView: 'show' } : {})}
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4"
        role="list"
        aria-describedby={showTitle ? subId : undefined}
        id={gridId}
      >
        {list.map((product, i) => {
          const key =
            (product as any)?._id ??
            (product as any)?.slug ??
            (product as any)?.id ??
            'bp-' + i

          return (
            <motion.li
              key={key}
              {...(!reduceMotion ? { variants: itemVariants } : {})}
              {...(!reduceMotion ? { whileHover: { y: -4 } } : {})}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              data-gtm="best_products_item"
              data-idx={i}
            >
              <ProductCard
                product={{
                  ...product,
                  title: (product as any).title ?? (product as any).name ?? 'Produit sans titre',
                  image:
                    (product as any).image ??
                    (product as any).imageUrl ??
                    (product as any).images?.[0] ??
                    '/og-image.jpg',
                }}
                /** Boost du LCP sur la 1ère rangée */
                priority={i < 4}
              />
            </motion.li>
          )
        })}
      </motion.ul>

      {/* Sentinel pour autoload */}
      {!expanded && limit > 0 && totalCount > limit && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => { setExpanded(true); pushDL('best_products_see_more_click') }}
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
            <div
              ref={sentinelRef}
              className="sr-only"
              aria-hidden="true"
            />
          )}
        </div>
      )}

      {/* SR live announcement */}
      <p id={liveId} className="sr-only" aria-live="polite">
        {announce}
      </p>

      {/* Noscript fallback */}
      <noscript>
        <p className="mt-6 text-center">
          <a href="/produit">Voir tous les produits</a>
        </p>
      </noscript>
    </section>
  )
}
