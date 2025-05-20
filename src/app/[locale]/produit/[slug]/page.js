'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useCart } from '@/context/cartContext'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import FAQBlock from '@/components/FAQBlock'
import AvisBlock from '@/components/AvisBlock'
import FreeShippingBadge from '@/components/FreeShippingBadge'

export default function ProductPage() {
  const { slug } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`/api/products/${slug}`)
      const data = await res.json()
      setProduct(data)
    }
    fetchProduct()
  }, [slug])

  const handleAddToCart = () => {
    addToCart(product)
    toast.success(`${product.title} ajouté au panier`)
  }

  if (!product) return <p className="p-4">Chargement...</p>

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.img
          src={product.image}
          alt={product.title}
          className="w-full rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        />
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
          <p className="text-xl text-gray-700 mb-4">{product.price} €</p>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <FreeShippingBadge />
          <button
            onClick={handleAddToCart}
            className="mt-4 bg-black text-white px-4 py-2 rounded hover:opacity-90"
          >
            Ajouter au panier
          </button>
        </div>
      </div>

      <div className="mt-10">
        <AvisBlock productId={product._id} />
      </div>

      <div className="mt-10">
        <FAQBlock productId={product._id} />
      </div>
    </div>
  )
}
