'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { motion } from 'framer-motion'

interface CartItemProps {
  item: {
    _id: string
    slug: string
    title: string
    image: string
    price: number
    quantity: number
  }
}

export default function CartItem({ item }: CartItemProps) {
  const { removeFromCart } = useCart()

  const handleRemove = () => {
    removeFromCart(item._id)
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-4 p-4 border rounded-lg shadow-sm dark:border-zinc-700 bg-white dark:bg-zinc-900"
      role="listitem"
      aria-label={`Produit : ${item.title}`}
    >
      <Link
        href={`/produit/${item.slug}`}
        className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label={`Voir le produit ${item.title}`}
      >
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover rounded"
          sizes="80px"
        />
      </Link>

      <div className="flex-1 space-y-1 min-w-0">
        <Link
          href={`/produit/${item.slug}`}
          className="font-semibold text-sm line-clamp-1 text-gray-900 dark:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {item.title}
        </Link>
        <p
          className="text-sm text-gray-600 dark:text-gray-400"
          aria-label={`Prix ${formatPrice(item.price)} × ${item.quantity}`}
        >
          {formatPrice(item.price)} × {item.quantity}
        </p>
      </div>

      <button
        onClick={handleRemove}
        className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
        aria-label={`Supprimer ${item.title} du panier`}
        title={`Supprimer ${item.title}`}
      >
        <Trash2 className="w-5 h-5 text-red-600" aria-hidden="true" />
      </button>
    </motion.li>
  )
}
