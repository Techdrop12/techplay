'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function StickyCartButton() {
  const [show, setShow] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const checkCart = () => {
      try {
        const items = JSON.parse(localStorage.getItem('cartItems') || '[]')
        setCount(items.length)
        setShow(items.length > 0)
      } catch {
        setShow(false)
      }
    }

    checkCart()
    window.addEventListener('storage', checkCart)
    return () => window.removeEventListener('storage', checkCart)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center md:hidden">
      <Link
        href="/panier"
        className="bg-black text-white text-sm px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce"
      >
        🛒 Voir mon panier ({count})
      </Link>
    </div>
  )
}
