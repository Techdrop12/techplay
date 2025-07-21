'use client'

import { formatPrice } from '@/lib/utils'
import { motion } from 'framer-motion'

interface PricingBadgeProps {
  price: number
  oldPrice?: number
  showDiscountLabel?: boolean
  showOldPrice?: boolean
}

export default function PricingBadge({
  price,
  oldPrice,
  showDiscountLabel = true,
  showOldPrice = true,
}: PricingBadgeProps) {
  const hasDiscount = oldPrice && oldPrice > price
  const discount = hasDiscount
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : null

  return (
    <motion.div
      className="flex items-center gap-2 text-sm sm:text-base"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="contentinfo"
      aria-label={`Prix : ${formatPrice(price)}${hasDiscount ? `, remise de ${discount}%` : ''}`}
    >
      <span className="font-bold text-brand">{formatPrice(price)}</span>

      {hasDiscount && showOldPrice && (
        <span className="line-through text-gray-400 dark:text-gray-500">
          {formatPrice(oldPrice!)}
        </span>
      )}

      {hasDiscount && showDiscountLabel && (
        <motion.span
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-semibold dark:bg-red-900/20 dark:text-red-400"
        >
          -{discount}%
        </motion.span>
      )}
    </motion.div>
  )
}
