'use client'

import { formatPrice, cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface PricingBadgeProps {
  price: number
  oldPrice?: number
  showDiscountLabel?: boolean
  showOldPrice?: boolean
  compact?: boolean
  className?: string
}

export default function PricingBadge({
  price,
  oldPrice,
  showDiscountLabel = true,
  showOldPrice = true,
  compact = false,
  className,
}: PricingBadgeProps) {
  const hasDiscount = typeof oldPrice === 'number' && oldPrice > price
  const discount = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-center gap-2', className)}
      role="contentinfo"
      aria-label={`Prix : ${formatPrice(price)}${discount ? `, ${discount}% de réduction` : ''}`}
    >
      <span className={cn('font-bold text-brand', compact ? 'text-sm' : 'text-sm sm:text-base')}>
        {formatPrice(price)}
      </span>

      {hasDiscount && showOldPrice && (
        <span className={cn('line-through text-gray-400 dark:text-gray-500', compact ? 'text-xs' : 'text-xs sm:text-sm')}>
          {formatPrice(oldPrice!)}
        </span>
      )}

      {hasDiscount && showDiscountLabel && (
        <motion.span
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={cn(
            'text-[11px] px-2 py-0.5 rounded font-semibold',
            'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          )}
        >
          -{discount}%
        </motion.span>
      )}
    </motion.div>
  )
}
