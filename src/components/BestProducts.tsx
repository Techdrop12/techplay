'use client'

import type { Product } from '@/types/product'
import ProductCard from '@/components/ProductCard'
import { motion } from 'framer-motion'

interface Props {
  products: Product[]
}

export default function BestProducts({ products }: Props) {
  if (!products.length) {
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
        className="text-2xl font-bold mb-6 text-center text-brand dark:text-brand-light"
      >
        Nos Meilleures Ventes
      </h2>

      <motion.ul
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        role="list"
      >
        {products.map((product) =>
          product ? (
            <li key={product._id}>
              <ProductCard
                product={{
                  ...product,
                  title: product.title ?? product.name ?? 'Produit',
                  image: product.image ?? product.imageUrl ?? '/placeholder.png',
                }}
              />
            </li>
          ) : null
        )}
      </motion.ul>
    </section>
  )
}
