// src/components/UpsellBlock.js
'use client'

import { useUpsell } from '@/context/upsellContext'
import ProductCard from './ProductCard'
import { useCart } from '@/context/cartContext'
import { toast } from 'react-hot-toast'

export default function UpsellBlock() {
  const { recommended, loading, error } = useUpsell()
  const { addToCart } = useCart()

  if (loading) return <p>Chargement des recommandations...</p>
  if (error) {
    toast.error(error)
    return null
  }

  if (!recommended.length) return null

  return (
    <section className="p-6 bg-gray-50 rounded shadow mt-8">
      <h2 className="text-xl font-semibold mb-4">Vous aimerez aussi</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {recommended.map(product => (
          <div key={product._id}>
            <ProductCard product={product} />
            <button
              className="mt-2 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
              onClick={() => {
                addToCart(product)
                toast.success(`${product.title} ajouté au panier`)
              }}
            >
              Ajouter au panier
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

