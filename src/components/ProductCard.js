'use client'

import { useCart } from '../context/cartContext'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import ReactStars from 'react-rating-stars-component'
import { useMemo } from 'react'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  const handleAdd = () => {
    addToCart(product)
    toast.success(`${product.title} ajouté au panier`)
  }

  // Note aléatoire pour l'effet visuel réaliste
  const rating = useMemo(() => (Math.random() * 1 + 4).toFixed(1), [])
  const reviews = useMemo(() => Math.floor(Math.random() * 50) + 5, [])

  return (
    <motion.div
      className="border rounded-lg p-4 flex flex-col justify-between shadow-sm"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-40 object-cover mb-2 rounded"
      />
      <h3 className="text-md font-semibold">{product.title}</h3>
      <p className="text-gray-600 text-sm">{product.category}</p>

      <div className="flex items-center mt-1 gap-1">
        <ReactStars
          count={5}
          value={Number(rating)}
          size={16}
          isHalf={true}
          edit={false}
          activeColor="#facc15"
        />
        <span className="text-sm text-gray-500">({reviews} avis)</span>
      </div>

      <p className="text-lg font-bold mt-1">{product.price} €</p>
      <motion.button
        onClick={handleAdd}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-2 px-4 py-1 bg-black text-white rounded text-sm"
      >
        Ajouter au panier
      </motion.button>
    </motion.div>
  )
}
