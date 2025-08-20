// src/components/ui/RatingStars.tsx
'use client'

import { useId, useMemo, useState, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Star } from 'lucide-react'
import clsx from 'clsx'

interface RatingStarsProps {
  value: number
  max?: number
  editable?: boolean
  onChange?: (value: number) => void
  size?: number
  ariaLabel?: string
  className?: string
}

/**
 * Stars avec :
 * - clamp & arrondi cohérents
 * - clavier (← → Home End + Enter/Espace) en mode éditable
 * - roving tabindex (un seul focusable)
 * - hover preview doux
 */
export default function RatingStars({
  value,
  max = 5,
  editable = false,
  onChange,
  size = 24,
  ariaLabel,
  className = '',
}: RatingStarsProps) {
  const id = useId()
  const prefersReduced = useReducedMotion()

  const safeMax = Math.max(1, Math.floor(max))
  const rounded = Math.max(0, Math.min(safeMax, Math.round(Number.isFinite(value) ? value : 0)))

  const [hover, setHover] = useState<number | null>(null)
  const current = hover ?? rounded

  const label = ariaLabel ?? `Note : ${rounded} sur ${safeMax} ${safeMax > 1 ? 'étoiles' : 'étoile'}`

  const commit = useCallback(
    (n: number) => {
      if (!editable) return
      const v = Math.max(1, Math.min(safeMax, n))
      onChange?.(v)
    },
    [editable, onChange, safeMax]
  )

  // Gestion clavier au niveau du conteneur
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!editable) return
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End', ' ', 'Enter'].includes(e.key)) e.preventDefault()
    const fast = e.shiftKey ? 2 : 1
    if (e.key === 'ArrowRight') commit((hover ?? rounded) + 1 * fast)
    if (e.key === 'ArrowLeft') commit((hover ?? rounded) - 1 * fast)
    if (e.key === 'Home') commit(1)
    if (e.key === 'End') commit(safeMax)
    if (e.key === ' ' || e.key === 'Enter') commit(hover ?? rounded)
  }

  const stars = useMemo(() => Array.from({ length: safeMax }), [safeMax])

  return (
    <div
      role={editable ? 'radiogroup' : 'img'}
      aria-label={label}
      className={clsx('flex items-center gap-1 outline-none', className)}
      onKeyDown={onKeyDown}
      tabIndex={editable ? 0 : -1}
    >
      {stars.map((_, i) => {
        const idx = i + 1
        const filled = idx <= current
        const selected = idx === rounded

        return (
          <motion.button
            key={`${id}-${idx}`}
            type="button"
            onMouseEnter={() => editable && setHover(idx)}
            onMouseLeave={() => editable && setHover(null)}
            onFocus={() => editable && setHover(idx)}
            onBlur={() => editable && setHover(null)}
            onClick={() => commit(idx)}
            disabled={!editable}
            role={editable ? 'radio' : undefined}
            aria-checked={editable ? selected : undefined}
            aria-label={`${idx} étoile${idx > 1 ? 's' : ''}`}
            tabIndex={editable ? (selected ? 0 : -1) : -1}
            initial={prefersReduced ? false : { scale: 0.92, opacity: 0 }}
            animate={prefersReduced ? undefined : { scale: 1, opacity: 1 }}
            whileHover={editable ? { scale: 1.15 } : undefined}
            whileTap={editable ? { scale: 0.95 } : undefined}
            className={clsx(
              'transition transform focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-full',
              'focus:ring-yellow-400',
              editable ? 'cursor-pointer' : 'cursor-default',
              filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            )}
          >
            <Star size={size} fill={filled ? 'currentColor' : 'none'} />
          </motion.button>
        )
      })}
      {/* Nombre lisible par SR uniquement */}
      <span className="sr-only">{rounded}/{safeMax}</span>
    </div>
  )
}
