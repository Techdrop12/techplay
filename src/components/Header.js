'use client'

import Link from 'next/link'
import { useCart } from '../context/cartContext'

export default function Header() {
  const { cart } = useCart()
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-black text-white">
      <Link href="/">
        <img src="/logo.png" alt="TechPlay logo" className="h-10" />
      </Link>

      <nav className="flex items-center space-x-4">
        {/* Lien panier avec compteur */}
        <Link href="/panier" className="relative">
          🛒
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full px-1">
              {totalItems}
            </span>
          )}
        </Link>

        {/* Lien vers la wishlist */}
        <Link href="/wishlist" className="hover:underline text-sm text-white">
          💖 Wishlist
        </Link>

        {/* Lien admin (corrigé) */}
        <Link href="/admin" className="text-sm text-white hover:underline">
          Admin
        </Link>
      </nav>
    </header>
  )
}
