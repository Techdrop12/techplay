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
    <div className="my-8">
      <h3 className="text-lg font-semibold mb-4">Derniers produits vus</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {products.map(p => (
          <Link key={p.slug} href={`/produit/${p.slug}`} className="border p-2 rounded">
            <img src={p.image} alt={p.name} className="w-full h-32 object-cover rounded" />
            <div className="mt-2 text-sm font-medium">{p.name}</div>
            <div className="text-xs text-gray-500">{p.price} €</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
