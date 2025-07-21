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
      className="flex items-center gap-4 p-3 border rounded-lg shadow-sm dark:border-zinc-700"
      role="listitem"
      aria-label={`Produit : ${item.title}`}
    >
      <Link href={`/produit/${item.slug}`} className="relative w-20 h-20 shrink-0">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover rounded"
          sizes="80px"
        />
      </Link>

      <div className="flex-1 space-y-1">
        <Link href={`/produit/${item.slug}`}>
          <p className="font-semibold text-sm line-clamp-1">{item.title}</p>
        </Link>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {formatPrice(item.price)} × {item.quantity}
        </p>
      </div>

      <button
        onClick={() => removeFromCart(item._id)}
        className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
        aria-label={`Supprimer ${item.title} du panier`}
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    </div>
  )
}
