'use client'

import { useId } from 'react'
import { motion } from 'framer-motion'
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

export default function RatingStars({
  value,
  max = 5,
  editable = false,
  onChange,
  size = 24,
  ariaLabel = `Note : ${value} sur ${max} étoiles`,
  className = '',
}: RatingStarsProps) {
  const id = useId()

  const handleClick = (index: number) => {
    if (editable && onChange) {
      onChange(index + 1)
    }
  }

  return (
    <div
      role={editable ? 'radiogroup' : 'img'}
      aria-label={ariaLabel}
      className={clsx('flex items-center gap-1', className)}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value)

        return (
          <motion.button
            key={`${id}-${i}`}
            type="button"
            onClick={() => handleClick(i)}
            disabled={!editable}
            role={editable ? 'radio' : undefined}
            aria-checked={editable ? i + 1 === Math.round(value) : undefined}
            aria-label={`${i + 1} étoile${i > 0 ? 's' : ''}`}
            className={clsx(
              'transition transform hover:scale-110 focus:outline-none',
              {
                'cursor-pointer': editable,
                'text-yellow-400': filled,
                'text-gray-300 dark:text-gray-600': !filled,
              }
            )}
          >
            <Star size={size} fill={filled ? 'currentColor' : 'none'} />
          </motion.button>
        )
      })}
    </div>
  )
}
