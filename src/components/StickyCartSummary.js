'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/context/cartContext'
import Link from 'next/link'

export default function StickyCartSummary() {
  const { cart } = useCart()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(cart.length > 0)
  }, [cart])

  if (!visible) return null

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-xl rounded-2xl p-4 w-72 animate-fade-in">
      <h4 className="font-semibold mb-2">Panier ({itemCount})</h4>
      <ul className="max-h-40 overflow-y-auto text-sm space-y-1">
        {cart.map((item) => (
          <li key={item._id} className="flex justify-between">
            <span>{item.title}</span>
            <span>{item.quantity}×{item.price}€</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 font-bold">Total : {total} €</div>
      <Link
        href="/panier"
        className="mt-3 block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 rounded-xl"
      >
        Finaliser mon panier
      </Link>
    </div>
  )
}
