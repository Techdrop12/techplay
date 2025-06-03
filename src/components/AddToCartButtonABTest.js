// src/components/AddToCartButtonABTest.js
'use client'

import { useEffect, useState } from 'react'
import { logEvent } from '@/lib/logEvent'

export default function AddToCartButtonABTest({ onClick, product, userEmail }) {
  const [variant, setVariant] = useState('A')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = window.localStorage.getItem('ab_variant')
    if (stored) {
      setVariant(stored)
    } else {
      const random = Math.random() < 0.5 ? 'A' : 'B'
      window.localStorage.setItem('ab_variant', random)
      setVariant(random)
    }
  }, [])

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      const currentCart = JSON.parse(window.localStorage.getItem('cartItems') || '[]')
      const updatedCart = [...currentCart, product]
      window.localStorage.setItem('cartItems', JSON.stringify(updatedCart))

      if (userEmail) {
        window.localStorage.setItem('cartEmail', userEmail)
      }
    }

    // 🔁 Backend tracking (MongoDB)
    fetch('/api/track-ab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant }),
    })

    // 📊 GA4 + Meta tracking (frontend)
    logEvent('add_to_cart_ab_test', {
      variant,
      productId: product?._id || product?.id || null,
    })

    onClick()
  }

  const label = variant === 'A' ? 'Ajouter au panier' : '🛒 Commander maintenant'

  return (
    <button
      onClick={handleClick}
      className={`${
        variant === 'A' ? 'bg-blue-600' : 'bg-green-500'
      } text-white px-4 py-2 rounded shadow`}
    >
      {label}
    </button>
  )
}
