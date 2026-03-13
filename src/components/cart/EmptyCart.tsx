'use client'

import { motion } from 'framer-motion'

import Link from '@/components/LocalizedLink'

interface EmptyCartProps {
  locale?: 'fr' | 'en'
}

export default function EmptyCart({ locale = 'fr' }: EmptyCartProps) {
  const isFr = locale === 'fr'

  const message = isFr ? 'Votre panier est vide' : 'Your cart is empty'
  const sub = isFr ? 'Découvrez nos produits et nos packs à prix avantageux.' : 'Discover our products and value packs.'
  const cta = isFr ? 'Voir les produits' : 'Browse products'
  const ctaPacks = isFr ? 'Voir les packs' : 'View packs'

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
      <h2 className="text-2xl font-semibold mb-2">{message}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">{sub}</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/products"
          className="inline-block bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-offset-zinc-900 transition"
        >
          {cta}
        </Link>
        <Link
          href="/products/packs"
          className="inline-block border border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition"
        >
          {ctaPacks}
        </Link>
      </div>
    </motion.div>
  )
}
