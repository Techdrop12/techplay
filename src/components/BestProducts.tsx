'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useMemo, useState } from 'react'
import type { Product } from '@/types/product'
import ProductCard from '@/components/ProductCard'

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
}

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

export default function BestProducts({
  products,
  showTitle = false,
  title = '⭐ Nos Meilleures Ventes',
  limit = 8,
  className,
}: BestProductsProps) {
  const headingId = useId()
  const subId = `${headingId}-sub`
  const gridId = `${headingId}-grid`

  const [expanded, setExpanded] = useState(false)
  const [announce, setAnnounce] = useState<string>('')

  const reduceMotion = useReducedMotion()

  const isEmpty = !Array.isArray(products) || products.length === 0

  const list = useMemo(() => {
    const arr = Array.isArray(products) ? products.filter(Boolean) : []
    if (!limit || expanded) return arr
    return arr.slice(0, limit)
  }, [products, limit, expanded])

  useEffect(() => {
    if (!expanded) return
    const remaining = Math.max(0, (products?.length ?? 0) - (limit || 0))
    if (remaining > 0) setAnnounce(`${remaining} produits supplémentaires affichés.`)
  }, [expanded, products, limit])

  if (isEmpty) {
    // Petit fallback élégant (plutôt qu’un “vide” strict)
    return (
      <section className={['max-w-6xl mx-auto px-4 py-10', className].filter(Boolean).join(' ')}>
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

  return (
    <section
      className={['max-w-6xl mx-auto px-4 py-10', className].filter(Boolean).join(' ')}
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
          <p id={subId} className="mb-8 text-center text-sm text-token-text/70">
            Les favoris de la communauté — stock limité.
            <span className="sr-only"> {products.length} produits disponibles.</span>
          </p>
        </>
      )}

      <motion.ul
        {...(!reduceMotion
          ? { variants: containerVariants, initial: 'hidden', whileInView: 'show' }
          : {})}
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
            `bp-${i}`

          const image =
            (product as any).image ??
            (product as any).imageUrl ??
            (product as any).images?.[0] ??
            '/og-image.jpg'

          return (
            <motion.li
              key={key}
              {...(!reduceMotion ? { variants: itemVariants } : {})}
              {...(!reduceMotion ? { whileHover: { y: -4 } } : {})}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <ProductCard
                product={{
                  ...product,
                  title: (product as any).title ?? 'Produit sans titre',
                  image,
                }}
                /** Boost du LCP sur la 1ère rangée */
                priority={i < 4}
              />
            </motion.li>
          )
        })}
      </motion.ul>

      {/* Bouton “Voir plus” si nécessaire */}
      {!expanded && limit > 0 && products.length > limit && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-2 rounded-full border border-token-border bg-token-surface px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]"
            aria-controls={gridId}
            aria-expanded={expanded ? 'true' : 'false'}
          >
            Voir plus
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="opacity-80">
              <path fill="currentColor" d="M7 10l5 5 5-5z" />
            </svg>
          </button>
        </div>
      )}

      {/* SR live announcement quand on étend la grille */}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </section>
  )
}
