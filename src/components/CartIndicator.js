'use client'

import Link from 'next/link'
import { useCart } from '@/context/cartContext'

export default function CartIndicator() {
  const { cart } = useCart()
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Link href="/panier" className="relative">
      🛒
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full px-1">
          {totalItems}
        </span>
      )}
    </Link>
  )
}
