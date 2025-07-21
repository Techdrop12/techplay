'use client'

import { Product } from '@/types/product'
import ProductCard from '@/components/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductGridProps {
  products: Product[]
  emptyMessage?: string
}

export default function ProductGrid({ products, emptyMessage }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        {emptyMessage || 'Aucun produit trouvé.'}
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
        aria-live="polite"
        role="list"
      >
        {products.map((product) => (
          <motion.div key={product._id} layout>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
