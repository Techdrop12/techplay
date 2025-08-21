'use client'

import { motion } from 'framer-motion'
import { useId, useMemo, useState } from 'react'
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
  const isEmpty = !products || products.length === 0
  const headingId = useId()
  const subId = `${headingId}-sub`

  const [expanded, setExpanded] = useState(false)

  const list = useMemo(() => {
    const arr = Array.isArray(products) ? products.filter(Boolean) : []
    if (!limit || expanded) return arr
    return arr.slice(0, limit)
  }, [products, limit, expanded])

  if (isEmpty) {
    return (
      <div
        className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500 dark:text-gray-400"
        role="status"
        aria-live="polite"
      >
        Aucun produit en vedette actuellement.
      </div>
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
            className="text-3xl sm:text-4xl font-extrabold mb-2 text-center text-brand dark:text-brand-light animate-fadeIn"
          >
            {title}
          </h2>
          <p id={subId} className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8">
            Les favoris de la communauté — stock limité.
            <span className="sr-only"> {products.length} produits disponibles.</span>
          </p>
        </>
      )}

      <motion.ul
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
        role="list"
        aria-describedby={showTitle ? subId : undefined}
        id={`${headingId}-grid`}
      >
        {list.map((product, i) => {
          const key = (product as any)?._id ?? (product as any)?.slug ?? (product as any)?.id ?? `${i}`
          const image =
            (product as any).image ??
            (product as any).imageUrl ??
            (product as any).images?.[0] ??
            '/og-image.jpg'

          return (
            <motion.li
              key={key}
              variants={itemVariants}
              whileHover={{ y: -4 }}
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
            className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 px-5 py-2.5 text-sm font-semibold shadow-sm hover:shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
            aria-controls={`${headingId}-grid`}
            aria-expanded="false"
          >
            Voir plus
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="opacity-80">
              <path fill="currentColor" d="M7 10l5 5 5-5z" />
            </svg>
          </button>
        </div>
      )}
    </section>
  )
}
