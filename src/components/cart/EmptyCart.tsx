'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface EmptyCartProps {
  locale?: 'fr' | 'en'
}

export default function EmptyCart({ locale = 'fr' }: EmptyCartProps) {
  const isFr = locale === 'fr'

  const message = isFr ? 'Votre panier est vide' : 'Your cart is empty'
  const cta = isFr ? 'Voir les produits' : 'Browse products'
  const ctaHref = isFr ? '/' : '/en'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      role="status"
      aria-live="polite"
      aria-label={message}
      className="text-center py-20 text-gray-600 dark:text-gray-300"
    >
      <h2 className="text-2xl font-semibold mb-6">{message}</h2>

      <Link
        href={ctaHref}
        className="inline-block bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-offset-zinc-900 transition"
      >
        {cta}
      </Link>
    </motion.div>
  )
}
