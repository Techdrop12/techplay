// ✅ components/CartIndicator.js
'use client'
import { useCart } from '@/context/cartContext'

export default function CartIndicator() {
  const { cart } = useCart()
  return (
    <span className="relative inline-block" aria-label="Panier">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {cart.length > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
          {cart.length}
        </span>
      )}
    </span>
  )
}
