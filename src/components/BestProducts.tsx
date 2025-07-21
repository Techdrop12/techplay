'use client'

import { useEffect, useState } from 'react'
import { getBestProducts } from '@/lib/data'
import type { Product } from '@/types/product'
import ProductCard from '@/components/ProductCard'
import { motion } from 'framer-motion'

export default function BestProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getBestProducts()
        setProducts(res || [])
      } catch (err) {
        console.error('Erreur récupération produits vedettes', err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  if (loading) {
    return (
      <div
        className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500"
        role="status"
        aria-live="polite"
      >
        Chargement des meilleures ventes...
      </div>
    )
  }

  if (!products.length) {
    return (
      <div
        className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500"
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
    >
      <h2
        id="best-products-heading"
        className="text-2xl font-bold mb-6 text-center text-brand"
      >
        Nos Meilleures Ventes
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        role="list"
      >
        {products.map((product) =>
          product ? (
            <ProductCard
              key={product._id}
              product={{
                ...product,
                title: product.title ?? product.name ?? 'Produit',
                image: product.image ?? product.imageUrl ?? '/placeholder.png',
              }}
            />
          ) : null
        )}
      </motion.div>
    </section>
  )
}
