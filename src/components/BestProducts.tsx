'use client'

import { motion } from 'framer-motion'
import { useId } from 'react'
import type { Product } from '@/types/product'
import ProductCard from '@/components/ProductCard'

interface BestProductsProps {
  products: Product[]
  /** affiche le titre interne (par défaut: false pour éviter les doublons) */
  showTitle?: boolean
  /** titre personnalisé si showTitle=true */
  title?: string
}

export default function BestProducts({ products, showTitle = false, title = '⭐ Nos Meilleures Ventes' }: BestProductsProps) {
  const isEmpty = !products || products.length === 0
  const headingId = useId()

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
      className="max-w-6xl mx-auto px-4 py-10"
      aria-labelledby={showTitle ? headingId : undefined}
      role="region"
    >
      {showTitle && (
        <h2
          id={headingId}
          className="text-3xl sm:text-4xl font-extrabold mb-8 text-center text-brand dark:text-brand-light animate-fadeIn"
        >
          {title}
        </h2>
      )}

      <motion.ul
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
        role="list"
      >
        {products.map((product) =>
          product ? (
            <li key={product._id}>
              <ProductCard
                product={{
                  ...product,
                  title: product.title ?? 'Produit sans titre',
                  image: (product as any).image ?? (product as any).images?.[0] ?? '/placeholder.png',
                }}
              />
            </li>
          ) : null
        )}
      </motion.ul>
    </section>
  )
}
