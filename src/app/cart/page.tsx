'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

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

  return (
    <div
      className="flex items-center gap-6 p-4 border rounded-xl shadow-md dark:border-zinc-700 bg-white dark:bg-gray-900"
      role="listitem"
      aria-label={`Produit : ${item.title}`}
    >
      <Link href={`/produit/${item.slug}`} className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-sm">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      <div className="flex-1 flex flex-col justify-center">
        <Link href={`/produit/${item.slug}`}>
          <p className="font-semibold text-lg line-clamp-1 text-gray-900 dark:text-white hover:underline">
            {item.title}
          </p>
        </Link>
        <p className="text-gray-600 dark:text-gray-400 text-base mt-1">
          {formatPrice(item.price)} × {item.quantity}
        </p>
      </div>

      <button
        onClick={() => removeFromCart(item._id)}
        className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
        aria-label={`Supprimer ${item.title} du panier`}
      >
        <Trash2 className="w-6 h-6 text-red-600" />
      </button>
    </div>
  )
}
