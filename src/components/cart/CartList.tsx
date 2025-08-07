'use client'

import type { Product } from '@/types/product'
import CartItem from '@/components/cart/CartItem'
import { motion, AnimatePresence } from 'framer-motion'

interface CartListProps {
  items: (Product & { quantity: number })[]
}

export default function CartList({ items }: CartListProps) {
  const isEmpty = !items?.length

  if (isEmpty) {
    return (
      <motion.p
        className="text-center text-gray-600 dark:text-gray-400 text-sm"
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Aucun article dans le panier.
      </motion.p>
    )
  }

  return (
    <ul
      role="list"
      aria-label="Liste des articles du panier"
      className="space-y-4"
    >
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.li
            key={item._id ?? item.slug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <CartItem
              item={{
                _id: item._id,
                slug: item.slug,
                title: item.title ?? 'Produit',
                image: item.image ?? '/placeholder.png',
                price: item.price ?? 0,
                quantity: item.quantity,
              }}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
