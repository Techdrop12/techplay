// src/components/QuantitySelector.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface QuantitySelectorProps {
  value?: number
  onChange?: (val: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  className,
}: QuantitySelectorProps) {
  const [qty, setQty] = useState(value ?? min)

  useEffect(() => {
    if (typeof value === 'number') setQty(value)
  }, [value])

  const update = (delta: number) => {
    const newVal = Math.min(max, Math.max(min, qty + delta))
    setQty(newVal)
    onChange?.(newVal)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('flex items-center gap-2', className)}
      role="spinbutton"
      aria-label="Quantité"
      aria-valuenow={qty}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
    >
      <button
        onClick={() => update(-step)}
        className="px-2 py-1 border rounded text-sm font-medium"
        aria-label="Diminuer la quantité"
        disabled={qty <= min}
      >
        −
      </button>
      <span
        className="min-w-[24px] text-center font-semibold"
        aria-live="polite"
        aria-atomic="true"
      >
        {qty}
      </span>
      <button
        onClick={() => update(step)}
        className="px-2 py-1 border rounded text-sm font-medium"
        aria-label="Augmenter la quantité"
        disabled={qty >= max}
      >
        +
      </button>
    </motion.div>
  )
}
