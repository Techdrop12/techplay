'use client'

import { useCart } from '@/hooks/useCart'
import CartList from '@/components/cart/CartList'
import StickyCartSummary from '@/components/StickyCartSummary'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useMemo } from 'react'
import { event } from '@/lib/ga'

export default function CartPageClient() {
  const { cart } = useCart()

  const isEmpty = useMemo(() => cart.length === 0, [cart])

  const handleExploreClick = () => {
    event({
      action: 'explore_products',
      category: 'navigation',
      label: 'Explore products from empty cart',
      value: 0,
    })
  }

  return (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10"
      role="main"
      aria-labelledby="page-title"
    >
      <h1
        id="page-title"
        className="text-3xl font-extrabold text-gray-900 dark:text-white text-center"
      >
        Mon panier
      </h1>

      {isEmpty ? (
        <motion.div
          className="text-center text-gray-600 dark:text-gray-400 text-lg space-y-4"
          role="alert"
          aria-live="polite"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p>Votre panier est vide.</p>
          <Link
            href="/products"
            onClick={handleExploreClick}
            className="inline-block text-sm text-white bg-black hover:bg-gray-800 transition px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-offset-zinc-900"
          >
            Explorer les produits
          </Link>
        </motion.div>
      ) : (
        <motion.section
          className="grid lg:grid-cols-3 gap-10"
          aria-label="Contenu du panier"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="lg:col-span-2">
            <CartList items={cart} />
          </div>
          <StickyCartSummary />
        </motion.section>
      )}
    </main>
  )
}
