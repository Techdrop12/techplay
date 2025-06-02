'use client'

import { useEffect, useState } from 'react'
import { getRecentProducts } from '@/lib/recentProducts'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function RecentProducts() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const data = getRecentProducts()
    if (Array.isArray(data)) setProducts(data)
  }, [])

  if (!products.length) return null

  return (
    <section className="my-12 max-w-6xl mx-auto px-4">
      <h3 className="text-xl font-semibold mb-4">Vu récemment</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              href={`/produit/${p.slug}`}
              className="block border p-2 rounded hover:shadow-sm transition bg-white"
            >
              <img
                src={p.image || '/default.jpg'}
                alt={p.name}
                className="w-full h-32 object-cover rounded mb-2"
                loading="lazy"
              />
              <p className="text-sm font-medium truncate">{p.name}</p>
              <p className="text-xs text-gray-500">{p.price} €</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
