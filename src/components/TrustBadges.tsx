'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Badge = {
  label: string
  emoji?: string
}

interface TrustBadgesProps {
  badges?: Badge[]
  className?: string
  /** Style de badge : card = cartes, pill = pastilles translucides, subtle = texte seul */
  variant?: 'card' | 'pill' | 'subtle'
}

const DEFAULT_BADGES: Badge[] = [
  { emoji: '✅', label: 'Paiement sécurisé' },
  { emoji: '🚀', label: 'Livraison rapide 48h' },
  { emoji: '💬', label: 'Support client 7j/7' },
  { emoji: '🔒', label: 'Satisfait ou remboursé' },
]

const container = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

function TrustBadges({
  badges = DEFAULT_BADGES,
  className,
  variant = 'card',
}: TrustBadgesProps) {
  const cardBase =
    'flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base font-medium'
  const cardStyles = {
    card:
      'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-md hover:shadow-lg border border-gray-200/70 dark:border-gray-700/70 transition-all',
    pill:
      'bg-white/70 dark:bg-gray-800/60 backdrop-blur text-gray-900 dark:text-gray-100 rounded-full shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-700/60 transition-all',
    subtle: 'bg-transparent text-gray-800 dark:text-gray-200',
  } as const

  return (
    <section
      className={cn(
        'py-10 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900',
        className
      )}
      aria-labelledby="trust-heading"
    >
      <h2 id="trust-heading" className="sr-only">
        Nos garanties de confiance
      </h2>

      <motion.ul
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        role="list"
        className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 px-4"
      >
        {badges.map(({ emoji = '✅', label }) => (
          <motion.li key={label} variants={item}>
            <div
              className={cn(cardBase, cardStyles[variant])}
              aria-label={label}
            >
              <span className="text-xl" aria-hidden="true">
                {emoji}
              </span>
              <span>{label}</span>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  )
}

export default memo(TrustBadges)
