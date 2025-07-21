'use client'

import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface StarsRatingProps {
  rating: number
  outOf?: number
  size?: number
  showValue?: boolean
}

export default function StarsRating({
  rating,
  outOf = 5,
  size = 18,
  showValue = true,
}: StarsRatingProps) {
  const filledStars = Math.round(rating)

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Note : ${rating} sur ${outOf}`}
    >
      {Array.from({ length: outOf }, (_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <Star
            size={size}
            className={
              i < filledStars
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }
            aria-hidden="true"
          />
        </motion.span>
      ))}
      {showValue && (
        <span className="ml-1 text-sm text-gray-600 dark:text-gray-300 font-medium">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  )
}
