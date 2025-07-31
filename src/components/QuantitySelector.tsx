'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface QuantitySelectorProps {
  value?: number
  onChange?: (val: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
  id?: string
  'aria-describedby'?: string
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  className,
  id,
  'aria-describedby': ariaDescribedBy,
}: QuantitySelectorProps) {
  const [qty, setQty] = useState(value ?? min)
  const btnMinusRef = useRef<HTMLButtonElement | null>(null)
  const btnPlusRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (typeof value === 'number') setQty(value)
  }, [value])

  const update = (delta: number) => {
    const newVal = Math.min(max, Math.max(min, qty + delta))
    setQty(newVal)
    onChange?.(newVal)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      update(step)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      update(-step)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-center gap-3', className)}
      role="spinbutton"
      aria-label="Quantité"
      aria-valuenow={qty}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      id={id}
      aria-describedby={ariaDescribedBy}
      onKeyDown={onKeyDown}
    >
      <button
        ref={btnMinusRef}
        onClick={() => update(-step)}
        className="px-3 py-1 border rounded-md text-lg font-bold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
        aria-label="Diminuer la quantité"
        disabled={qty <= min}
      >
        −
      </button>

      <span
        className="min-w-[32px] text-center font-semibold select-none text-lg"
        aria-live="polite"
        aria-atomic="true"
      >
        {qty}
      </span>

      <button
        ref={btnPlusRef}
        onClick={() => update(step)}
        className="px-3 py-1 border rounded-md text-lg font-bold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
        aria-label="Augmenter la quantité"
        disabled={qty >= max}
      >
        +
      </button>
    </motion.div>
  )
}
