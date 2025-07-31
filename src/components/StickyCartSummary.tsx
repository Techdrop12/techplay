'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '@/context/cartContext'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice } from '@/lib/utils'
import { event } from '@/lib/ga'
import { useTranslations } from 'next-intl'
import type { Product } from '@/types/product'

type CartItem = Product & { quantity: number }

interface Props {
  locale?: string
}

export default function StickyCartSummary({ locale = 'fr' }: Props) {
  const { cart } = useCart()
  const pathname = usePathname()
  const t = useTranslations('cart')

  const [visible, setVisible] = useState(false)

  const typedCart: CartItem[] = cart ?? []
  const itemCount = typedCart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = typedCart.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0)

  useEffect(() => {
    const shouldShow =
      itemCount > 0 && !['/checkout', '/commande', '/cart', '/panier'].some(path => pathname.includes(path))
    setVisible(shouldShow)
  }, [pathname, itemCount])

  const handleClick = () => {
    event({
      action: 'view_cart_mobile',
      category: 'engagement',
      label: 'Sticky cart CTA',
      value: totalPrice,
    })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sticky-cart-summary"
          className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700 px-4 py-3 flex justify-between items-center shadow-xl md:hidden"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          role="complementary"
          aria-label={t('mobile_summary', { count: itemCount })}
        >
          <div
            className="text-sm font-medium text-gray-900 dark:text-gray-100"
            aria-live="polite"
          >
            🛒 {itemCount} {t('item', { count: itemCount })} –{' '}
            <span className="font-bold">{formatPrice(totalPrice)}</span>
          </div>

          <Link
            href={`/${locale}/cart`}
            onClick={handleClick}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
            aria-label={t('view_cart')}
          >
            {t('view_cart')}
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
