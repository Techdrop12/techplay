'use client'

import { motion } from 'framer-motion'
import type { Product } from '@/types/product'
import ProductCard from '@/components/ProductCard'

interface BestProductsProps {
  products: Product[]
}

export default function BestProducts({ products }: BestProductsProps) {
  const isEmpty = !products || products.length === 0

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
      aria-labelledby="best-products-heading"
      role="region"
    >
      <h2
        id="best-products-heading"
        className="text-3xl sm:text-4xl font-extrabold mb-8 text-center text-brand dark:text-brand-light animate-fadeIn"
      >
        ⭐ Nos Meilleures Ventes
      </h2>

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
                  image: product.image ?? '/placeholder.png',
                }}
              />
            </li>
          ) : null
        )}
      </motion.ul>
    </section>
  )
}
