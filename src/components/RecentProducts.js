'use client'

import { useEffect, useState } from 'react'
import { getRecentProducts } from '@/lib/recentProducts'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function RecentProducts() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const data = getRecentProducts()
    if (Array.isArray(data)) setProducts(data)
  }, [])

  if (!products.length) return null

  return (
    <section className="my-12 max-w-6xl mx-auto px-4">
      <h3 className="text-xl font-semibold mb-4">🔁 Vu récemment</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((p, i) => (
          <motion.div
            key={p.slug || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/produit/${p.slug}`}
              className="block border p-2 rounded-lg hover:shadow transition bg-white"
            >
              <div className="relative w-full h-32 mb-2">
                <Image
                  src={p.image || '/default.jpg'}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover rounded"
                  loading="lazy"
                />
              </div>
              <p className="text-sm font-medium line-clamp-2">{p.name}</p>
              <p className="text-xs text-gray-600">{p.price} €</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
