'use client'

import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import { useCart } from '@/context/cartContext'

export default function UpsellProducts() {
  const { cart } = useCart()
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    if (!cart.length) return

    // Extraire catégorie majoritaire du panier pour recommendations simples
    const categoryCounts = {}
    cart.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
    })

    const mainCategory = Object.entries(categoryCounts).sort((a,b) => b[1] - a[1])[0]?.[0]

    if (!mainCategory) return

    const excludeIds = cart.map(item => item._id)

    fetch(`/api/products/recommendations?category=${mainCategory}&excludeIds=${excludeIds.join(',')}`)
      .then(res => res.json())
      .then(setRecommendations)
      .catch(() => setRecommendations([]))
  }, [cart])

  if (!recommendations.length) return null

  return (
    <section className="p-4 bg-gray-50 rounded mt-8">
      <h2 className="text-xl font-semibold mb-4">Vous pourriez aimer aussi</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {recommendations.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  )
}
