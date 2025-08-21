'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

type IconName = 'lock' | 'truck' | 'chat' | 'shield' | 'refund' | 'stripe' | 'paypal' | 'rocket'

type Badge = {
  /** Libellé affiché (obligatoire) */
  label: string
  /** (Option) Emoji rétrocompatible */
  emoji?: string
  /** (Option) Icône vectorielle premium */
  icon?: IconName
  /** (Option) Lien cliquable (ex: /cgv, /contact) */
  href?: string
  /** (Option) Description courte pour SR uniquement */
  sr?: string
}

interface TrustBadgesProps {
  badges?: Badge[]
  className?: string
  /** Présentation visuelle */
  variant?: 'card' | 'pill' | 'subtle' | 'premium'
  /** Densité */
  compact?: boolean
}

/* ----------------------------- Icônes vectorielles ----------------------------- */
function Icon({ name, className }: { name: IconName; className?: string }) {
  const common = 'w-5 h-5 sm:w-6 sm:h-6'
  switch (name) {
    case 'lock':
      return (
        <svg viewBox="0 0 24 24" className={cn(common, className)} aria-hidden="true" fill="currentColor">
          <path d="M17 9h-1V7a4 4 0 10-8 0v2H7a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2Zm-7-2a2 2 0 114 0v2h-4V7Z" />
        </svg>
      )
    case 'truck':
      return (
        <svg viewBox="0 0 24 24" className={cn(common, className)} aria-hidden="true" fill="currentColor">
          <path d="M3 5a1 1 0 011-1h10a1 1 0 011 1v9h2.382a2 2 0 001.789-1.106l.894-1.789A2 2 0 0019.276 9H17V7h2.276a4 4 0 013.577 2.211l.894 1.789A4 4 0 0118.382 15H3a1 1 0 01-1-1V5Zm3 13a2 2 0 114 0 2 2 0 01-4 0Zm9 0a2 2 0 114 0 2 2 0 01-4 0Z" />
        </svg>
      )
    case 'rocket':
      return (
        <svg viewBox="0 0 24 24" className={cn(common, className)} aria-hidden="true" fill="currentColor">
          <path d="M14 3a8 8 0 00-7.071 4.243L3 11.172l2.828 2.829 3.93-3.93A8 8 0 0014 3Zm7 7a8 8 0 00-8-8h-1l-2 2 4 4 2-2a6 6 0 015 4ZM4 18l2-2 2 2-2 2a2 2 0 01-2-2Zm9.293-6.707l-5.586 5.586a2 2 0 102.828 2.828l5.586-5.586a2 2 0 10-2.828-2.828Z" />
        </svg>
      )
    case 'chat':
      return (
        <svg viewBox="0 0 24 24" className={cn(common, className)} aria-hidden="true" fill="currentColor">
          <path d="M4 4h16a2 2 0 012 2v9a2 2 0 01-2 2H8l-4 4V6a2 2 0 012-2Z" />
        </svg>
      )
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" className={cn(common, className)} aria-hidden="true" fill="currentColor">
          <path d="M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4Zm-1 13l5-5-1.41-1.41L11 12.17l-1.59-1.58L8 12l3 3Z" />
        </svg>
      )
    case 'refund':
      return (
        <svg viewBox="0 0 24 24" className={cn(common, className)} aria-hidden="true" fill="currentColor">
          <path d="M12 2a10 10 0 100 20v-2a8 8 0 110-16V2Zm1 4h-2v6h4v-2h-2V6Z" />
        </svg>
      )
    case 'stripe':
      return (
        <svg viewBox="0 0 24 24" className={cn(common, className)} aria-hidden="true" fill="currentColor">
          <path d="M4 6h16v12H4z" opacity=".15" /><path d="M7 10h5a2 2 0 110 4H9v2H7v-6Zm2 2v2h3a1 1 0 000-2H9Z" />
        </svg>
      )
    case 'paypal':
      return (
        <svg viewBox="0 0 24 24" className={cn(common, className)} aria-hidden="true" fill="currentColor">
          <path d="M6 18l1-6h6a4 4 0 000-8H8L7 10h6a2 2 0 010 4H9l-1 4H6Z" />
        </svg>
      )
  }
}

/* -------------------------- Badges par défaut (premium) -------------------------- */
const DEFAULT_BADGES: Badge[] = [
  { icon: 'lock', label: 'Paiement sécurisé', sr: 'Paiement sécurisé (Stripe, PayPal, SSL 256 bits)' },
  { icon: 'truck', label: 'Livraison 48–72h', sr: 'Livraison sous 48 à 72 heures' },
  { icon: 'chat', label: 'Support 7j/7', sr: 'Support client réactif, 7 jours sur 7' },
  { icon: 'shield', label: 'Satisfait ou remboursé', sr: 'Garantie satisfait ou remboursé' },
]

function TrustBadges({
  badges = DEFAULT_BADGES,
  className,
  variant = 'card',
  compact = false,
}: TrustBadgesProps) {
  const prefersReduced = useReducedMotion()

  const base =
    'flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base font-medium select-none'
  const spacing = compact ? 'py-6' : 'py-12'

  const variants: Record<NonNullable<TrustBadgesProps['variant']>, string> = {
    card:
      'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-md hover:shadow-lg border border-gray-200/70 dark:border-gray-700/70 transition-all',
    pill:
      'bg-white/70 dark:bg-gray-800/60 backdrop-blur text-gray-900 dark:text-gray-100 rounded-full shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-700/60 transition-all',
    subtle: 'bg-transparent text-gray-800 dark:text-gray-200',
    premium:
      [
        'relative rounded-xl',
        'bg-white/70 dark:bg-zinc-900/60 backdrop-blur',
        'text-gray-900 dark:text-gray-100',
        'shadow-md hover:shadow-lg',
        'ring-1 ring-gray-200/70 dark:ring-gray-800/60',
        'border border-white/30 dark:border-white/10',
        'transition-all',
      ].join(' '),
  }

  const items = useMemo(() => badges.map((b) => ({ ...b })), [badges])

  return (
    <section
      className={cn('border-t border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-black', spacing, className)}
      aria-labelledby="trust-heading"
    >
      <h2 id="trust-heading" className="sr-only">
        Nos garanties de confiance
      </h2>

      <ul className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 px-4" role="list">
        {items.map(({ emoji, icon, label, href, sr }, i) => {
          const content = (
            <div className={cn(base, variants[variant])} aria-label={label}>
              {/* Anneau conique subtil pour le variant premium */}
              {variant === 'premium' && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-[1px] rounded-[18px] bg-[conic-gradient(from_140deg,rgba(59,130,246,.45),transparent_40%,rgba(14,165,233,.35),transparent_70%)] opacity-30 blur"
                />
              )}

              {/* Icône */}
              {icon ? (
                <Icon name={icon} className="opacity-90" />
              ) : (
                <span className="text-xl" aria-hidden="true">
                  {emoji ?? '✅'}
                </span>
              )}

              {/* Libellé + SR */}
              <span className="relative z-10">{label}</span>
              {sr ? <span className="sr-only"> — {sr}</span> : null}
            </div>
          )

          return (
            <motion.li
              key={label}
              initial={prefersReduced ? false : { opacity: 0, y: 8 }}
              whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              whileHover={prefersReduced ? undefined : { scale: 1.015 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.28, ease: 'easeOut', delay: i * 0.05 }}
              className="relative"
            >
              {href ? (
                <Link href={href} className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 rounded-xl">
                  {content}
                </Link>
              ) : (
                content
              )}
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}

export default memo(TrustBadges)
