'use client'

import { useEffect, useState } from 'react'

export default function AddToCartButtonABTest({ onClick, product, userEmail }) {
  const [variant, setVariant] = useState('A')

  useEffect(() => {
    const stored = localStorage.getItem('ab_variant')
    if (stored) {
      setVariant(stored)
    } else {
      const random = Math.random() < 0.5 ? 'A' : 'B'
      localStorage.setItem('ab_variant', random)
      setVariant(random)
    }
  }, [])

  const handleClick = () => {
    const currentCart = JSON.parse(localStorage.getItem('cartItems') || '[]')
    const updatedCart = [...currentCart, product]
    localStorage.setItem('cartItems', JSON.stringify(updatedCart))

    if (userEmail) {
      localStorage.setItem('cartEmail', userEmail)
    }

    fetch('/api/track-ab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant }),
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

