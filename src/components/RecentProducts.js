'use client'

import { useEffect, useState } from 'react'
import { getRecentProducts } from '@/lib/recentProducts'
import Link from 'next/link'

export default function RecentProducts() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const data = getRecentProducts()
    setProducts(data)
  }, [])

  if (!products.length) return null

  return (
    <section className="my-12">
      <h3 className="text-xl font-semibold mb-4">Vu récemment</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {products.map((p, i) => (
          <Link
            key={i}
            href={`/produit/${p.slug}`}
            className="border p-2 rounded hover:shadow-sm transition"
          >
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-32 object-cover rounded mb-1"
              loading="lazy"
            />
            <p className="text-sm font-medium truncate">{p.name}</p>
            <p className="text-xs text-gray-500">{p.price} €</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
