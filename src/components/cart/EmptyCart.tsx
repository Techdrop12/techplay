// src/components/cart/EmptyCart.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface EmptyCartProps {
  locale?: 'fr' | 'en'
}

export default function EmptyCart({ locale = 'fr' }: EmptyCartProps) {
  const isFr = locale === 'fr'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-20 text-gray-600 dark:text-gray-300"
      role="status"
      aria-live="polite"
    >
      <h2 className="text-xl font-semibold mb-4">
        {isFr ? 'Votre panier est vide' : 'Your cart is empty'}
      </h2>

      <Link
        href={isFr ? '/' : '/en'}
        className="inline-block text-blue-600 dark:text-blue-400 hover:underline font-medium"
      >
        {isFr ? 'Voir les produits' : 'Browse products'}
      </Link>
    </motion.div>
  )
}
