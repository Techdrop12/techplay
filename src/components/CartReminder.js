'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CartReminder() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const storedCart = localStorage.getItem('cart')
    if (storedCart && JSON.parse(storedCart).length > 0) {
      const timer = setTimeout(() => setShow(true), 7000) // 7 secondes
      return () => clearTimeout(timer)
    }
  }, [])

  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-white border border-gray-300 shadow-md rounded px-4 py-3 z-50"
      onClick={() => setShow(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setShow(false)}
    >
      <p className="text-sm">🛒 Vous avez un panier en attente !</p>
      <Link
        href="/panier"
        className="text-blue-600 underline text-sm mt-1 inline-block"
      >
        Voir mon panier →
      </Link>
    </motion.div>
  )
}
