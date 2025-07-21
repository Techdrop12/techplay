'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '@/context/cartContext'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice } from '@/lib/utils'

interface Props {
  locale?: string
}

interface CartItem {
  price: number
  quantity: number
}

export default function StickyCartSummary({ locale = 'fr' }: Props) {
  const { cart } = useCart() as { cart: CartItem[] }
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  useEffect(() => {
    const showOnPage = !pathname.includes('/checkout') && cart.length > 0
    setVisible(showOnPage)
  }, [cart, pathname])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700 px-4 py-3 flex justify-between items-center shadow-lg md:hidden"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 300 }}
          role="complementary"
          aria-label="Résumé du panier"
        >
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            🛒 {itemCount} article{itemCount > 1 ? 's' : ''} –{' '}
            <span className="font-bold">{formatPrice(totalPrice)}</span>
          </div>

          <Link
            href={`/${locale}/panier`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
            aria-label="Voir le panier"
          >
            Voir le panier
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
