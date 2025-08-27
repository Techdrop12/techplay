'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import Price from './Price'
import { cn } from '@/lib/utils'

type Numeric = number | string

export interface PricingBadgeProps {
  amount?: Numeric
  price?: Numeric
  original?: Numeric
  oldPrice?: Numeric
  currency?: string
  locale?: string
  showDiscountLabel?: boolean
  showOriginal?: boolean
  showOldPrice?: boolean
  compact?: boolean
  className?: string
  microdata?: boolean
}

function toNumber(val: Numeric | undefined): number | null {
  if (val == null) return null
  if (typeof val === 'number') return Number.isFinite(val) ? val : null
  if (typeof val === 'string') {
    const n = Number(val.trim().replace(/\s/g, '').replace(',', '.'))
    return Number.isFinite(n) ? n : null
  }
  return null
}

export default function PricingBadge({
  amount,
  price,
  original,
  oldPrice,
  currency = 'EUR',
  locale = 'fr-FR',
  showDiscountLabel = true,
  showOriginal,
  showOldPrice,
  compact = false,
  className,
  microdata,
}: PricingBadgeProps) {
  const current = toNumber(amount ?? price) ?? 0
  const orig = toNumber(original ?? oldPrice)
  const hasDiscount = orig != null && orig > current
  const discount = hasDiscount ? Math.round(((orig - current) / orig) * 100) : null
  const effectiveShowOriginal = showOldPrice ?? showOriginal ?? true

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="contentinfo"
      aria-label={
        hasDiscount
          ? `Prix : ${current} ${currency}, ${discount}% de réduction`
          : `Prix : ${current} ${currency}`
      }
    >
      <Price
        amount={current}
        original={effectiveShowOriginal && hasDiscount ? orig! : undefined}
        currency={currency}
        locale={locale}
        compact={compact}
        microdata={microdata}
        className="text-base sm:text-lg"
      />
      {hasDiscount && showDiscountLabel && (
        <motion.span
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-semibold
                     dark:bg-red-900/20 dark:text-red-400"
        >
          -{discount}%
        </motion.span>
      )}
    </div>
  )
}
