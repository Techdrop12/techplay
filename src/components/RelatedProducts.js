'use client'

import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'

export default function RelatedProducts({ currentCategory, currentId }) {
  const [related, setRelated] = useState([])

  useEffect(() => {
    async function fetchRelated() {
      const res = await fetch('/api/products')
      const data = await res.json()

      const filtered = data
        .filter((p) => p.category === currentCategory && p._id !== currentId)
        .slice(0, 4)

      setRelated(filtered)
    }

    fetchRelated()
  }, [currentCategory, currentId])

  if (related.length === 0) return null

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-2">Produits similaires</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {related.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  )
}
