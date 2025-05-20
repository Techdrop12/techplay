'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import FAQBlock from '@/components/FAQBlock'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(res => res.json())
      .then(setProduct)
  }, [slug])

  if (!product) return <p>Chargement...</p>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <img src={product.image} alt={product.title} className="w-full h-60 object-cover rounded mb-4" />
      <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
      <p className="text-gray-600 mb-2">{product.category}</p>
      <p className="text-lg font-bold mb-4">{product.price} €</p>
      <button className="bg-black text-white py-2 px-4 rounded mb-6">Ajouter au panier</button>
      <p className="mb-6">{product.description}</p>

      {/* Bloc FAQ intégré */}
      <FAQBlock productId={product._id} />
    </div>
  )
}
