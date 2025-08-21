'use client'

import { memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Badge = { label: string; emoji?: string }

interface TrustBadgesProps {
  badges?: Badge[]
  className?: string
  variant?: 'card' | 'pill' | 'subtle'
}

const DEFAULT_BADGES: Badge[] = [
  { emoji: '✅', label: 'Paiement sécurisé' },
  { emoji: '🚀', label: 'Livraison rapide 48h' },
  { emoji: '💬', label: 'Support client 7j/7' },
  { emoji: '🔒', label: 'Satisfait ou remboursé' },
]

function TrustBadges({ badges = DEFAULT_BADGES, className, variant = 'card' }: TrustBadgesProps) {
  const prefersReduced = useReducedMotion()

  const base = 'flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base font-medium'
  const variants = {
    card: 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-md hover:shadow-lg border border-gray-200/70 dark:border-gray-700/70 transition-all',
    pill: 'bg-white/70 dark:bg-gray-800/60 backdrop-blur text-gray-900 dark:text-gray-100 rounded-full shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-700/60 transition-all',
    subtle: 'bg-transparent text-gray-800 dark:text-gray-200',
  } as const

  return (
    <section
      className={cn('py-10 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900', className)}
      aria-labelledby="trust-heading"
    >
      <h2 id="trust-heading" className="sr-only">Nos garanties de confiance</h2>

      <ul className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 px-4" role="list">
        {badges.map(({ emoji = '✅', label }, i) => (
          <motion.li
            key={label}
            initial={prefersReduced ? false : { opacity: 0, y: 8 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: i * 0.06 }}
          >
            <div className={cn(base, variants[variant])} aria-label={label}>
              <span className="text-xl" aria-hidden="true">{emoji}</span>
              <span>{label}</span>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}

export default memo(TrustBadges)
