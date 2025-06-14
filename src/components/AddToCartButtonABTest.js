'use client'

import { useEffect, useState } from 'react'
import { logEvent } from '@/lib/logEvent'

export default function AddToCartButtonABTest({ onClick, product, userEmail }) {
  const [variant, setVariant] = useState('A')

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('ab_variant')
      if (stored) {
        setVariant(stored)
      } else {
        const random = Math.random() < 0.5 ? 'A' : 'B'
        localStorage.setItem('ab_variant', random)
        setVariant(random)
      }
    } catch (e) {
      console.warn('Erreur lecture variant localStorage :', e)
    }
  }, [])

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      try {
        const currentCart = JSON.parse(localStorage.getItem('cartItems') || '[]')
        const updatedCart = [...currentCart, { ...product, quantity: 1 }]
        localStorage.setItem('cartItems', JSON.stringify(updatedCart))

        if (userEmail) {
          localStorage.setItem('cartEmail', userEmail)
        }
      } catch (e) {
        console.warn('Erreur stockage panier :', e)
      }
    }

    // ✅ Enregistrement backend MongoDB
    fetch('/api/track-ab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant }),
    })

    // ✅ Tracking GA4 + Meta Pixel
    logEvent('add_to_cart_ab_test', {
      variant,
      productId: product?._id || product?.id || null,
    })

    if (typeof onClick === 'function') {
      onClick()
    }
  }

  const label = variant === 'A' ? 'Ajouter au panier' : '🛒 Commander maintenant'
  const bgColor = variant === 'A' ? 'bg-blue-600' : 'bg-green-500'

  return (
    <button
      onClick={handleClick}
      className={`${bgColor} text-white px-4 py-2 rounded shadow w-full transition hover:opacity-90`}
    >
      {label}
    </button>
  )
}
