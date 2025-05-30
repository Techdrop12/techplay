'use client'

import { useCart } from '@/context/cartContext'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import ReactStars from 'react-rating-stars-component'
import { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { logEvent } from '@/lib/logEvent'
import { getUserVariant } from '@/lib/abTestVariants'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const router = useRouter()

  const [variant, setVariant] = useState('A')

  useEffect(() => {
    const v = getUserVariant()
    setVariant(v)
    logEvent('ab_variant_view', {
      variant: v,
      item_name: product.title,
    })
  }, [product.title])

  const handleAdd = () => {
    addToCart(product)
    toast.success(`${product.title} ajouté au panier`)
    logEvent('add_to_cart', {
      item_name: product.title,
      price: product.price,
      variant,
    })
  }

  const handleQuickBuy = () => {
    addToCart({ ...product, quantity: 1 })
    router.push('/panier')
    logEvent('begin_checkout', {
      item_name: product.title,
      price: product.price,
      variant,
    })
  }

  const rating = useMemo(() => (Math.random() * 1 + 4).toFixed(1), [])
  const reviews = useMemo(() => Math.floor(Math.random() * 50) + 5, [])

  // A/B Test
  const displayImage = variant === 'B' && product.imageAlt ? product.imageAlt : product.image
  const displayTitle = variant === 'C' ? `${product.title} - Édition limitée` : product.title
  const displayPrice = variant === 'B'
    ? `${(product.price * 0.95).toFixed(2)} €`
    : `${product.price.toFixed(2)} €`
  const ctaText = variant === 'C' ? 'Je le veux !' : variant === 'B' ? 'Top deal !' : 'Ajouter au panier'
  const ctaColor = variant === 'B' ? 'bg-indigo-600' : variant === 'C' ? 'bg-orange-600' : 'bg-black'

  return (
    <motion.div
      className="border rounded-lg p-4 flex flex-col justify-between shadow-md hover:shadow-xl transition"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <img
        src={displayImage}
        alt={displayTitle}
        className="w-full h-40 object-cover mb-2 rounded"
        loading="lazy"
      />
      <h3 className="text-md font-semibold">{displayTitle}</h3>
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

      <p className="text-lg font-bold mt-1">{displayPrice}</p>

      <motion.button
        onClick={handleAdd}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`mt-2 px-4 py-2 ${ctaColor} text-white rounded text-sm`}
      >
        {ctaText}
      </motion.button>

      <motion.button
        onClick={handleQuickBuy}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded text-sm"
      >
        Acheter maintenant
      </motion.button>
    </motion.div>
  )
}
