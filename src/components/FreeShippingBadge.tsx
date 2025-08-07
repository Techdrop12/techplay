'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FreeShippingBadgeProps {
  price: number
  threshold?: number
  className?: string
  minimal?: boolean
}

export default function FreeShippingBadge({
  price,
  threshold = 49,
  className,
  minimal = false,
}: FreeShippingBadgeProps) {
  if (typeof price !== 'number') return null

  const isEligible = price >= threshold
  const remaining = (threshold - price).toFixed(2)

  const baseStyle = 'inline-block px-2 py-1 text-xs font-medium rounded transition shadow-sm'
  const eligibleStyle = 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300'
  const alertStyle = 'bg-yellow-100 text-yellow-800 animate-pulse dark:bg-yellow-900/30 dark:text-yellow-300'

  const content = isEligible
    ? minimal
      ? '✅ Livraison offerte'
      : '🚚 Livraison gratuite'
    : `Encore ${remaining} € pour la livraison gratuite`

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role={isEligible ? 'status' : 'alert'}
      aria-live="polite"
      className={cn(
        baseStyle,
        isEligible ? eligibleStyle : alertStyle,
        className
      )}
    >
      {content}
    </motion.div>
  )
}
