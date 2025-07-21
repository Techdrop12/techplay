'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PromoBadgeProps {
  discount?: number
  text?: string
  className?: string
}

export default function PromoBadge({ discount, text = 'Promo', className }: PromoBadgeProps) {
  // Ne rien afficher si pas de discount et pas de texte personnalisé
  if (!discount && !text) return null

  const content = discount && discount > 0 ? `−${discount}%` : `🔥 ${text}`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md',
        className
      )}
      role="status"
      aria-label="Promotion"
    >
      {content}
    </motion.div>
  )
}
