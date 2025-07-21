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
  className = '',
  minimal = false,
}: FreeShippingBadgeProps) {
  if (typeof price !== 'number') return null

  const isEligible = price >= threshold
  const remaining = (threshold - price).toFixed(2)

  const content = isEligible
    ? '🚚 Livraison gratuite'
    : `Plus que ${remaining} € pour la livraison gratuite`

  const baseStyle =
    'inline-block px-2 py-1 text-xs font-medium rounded transition shadow-sm'

  const eligibleStyle = 'bg-green-100 text-green-800'
  const alertStyle = 'bg-yellow-100 text-yellow-800 animate-pulse'

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
      {minimal && isEligible ? '✅ Livraison offerte' : content}
    </motion.div>
  )
}
