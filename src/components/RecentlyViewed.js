'use client'

import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'

export default function RecentlyViewed() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    setProducts(recent.reverse())
  }, [])

  if (products.length === 0) return null

  return (
    <div className="mt-10">
      <h3 className="text-xl font-bold mb-4">🔁 Vu récemment</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  )
}
