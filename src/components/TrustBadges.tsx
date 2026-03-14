'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { memo, useMemo } from 'react'

import Link from '@/components/LocalizedLink'
import { cn } from '@/lib/utils'

type IconName =
  | 'lock'
  | 'truck'
  | 'chat'
  | 'shield'
  | 'refund'
  | 'stripe'
  | 'paypal'
  | 'rocket'

type Badge = {
  /** Libellé affiché (obligatoire) */
  label: string
  /** (DEPRECATED) — on n’affiche plus d’emoji */
  emoji?: string
  /** Icône vectorielle premium (recommandé) */
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
  const common = 'w-5 h-5 shrink-0'
  switch (name) {
    case 'lock':
      return (
        <svg viewBox="0 0 24 24" className={cn(common, className)} aria-hidden="true" fill="currentColor">
          <path d="M12 2a5 5 0 00-5 5v2H6a3 3 0 00-3 3v7a3 3 0 003 3h12a3 3 0 003-3v-7a3 3 0 00-3-3h-1V7a5 5 0 00-5-5Zm-3 7V7a3 3 0 116 0v2H9Z" />
        </svg>
      )
    case 'truck':
      return (
        <svg viewBox="0 0 24 24" className={cn(common, className)} aria-hidden="true" fill="currentColor">
          <path d="M3 6h11a1 1 0 011 1v3h3.8a1 1 0 01.9.6l1.3 3a2 2 0 01.1.8V18a2 2 0 01-2 2h-1a2.5 2.5 0 11-5 0H9.5a2.5 2.5 0 11-5 0H4a2 2 0 01-2-2V8a2 2 0 012-2Zm12 4V8H4v10h.5a2.5 2.5 0 015 0H15v-5h3.7l-.8-1.9H15Zm2.5 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3ZM7 19.5A1.5 1.5 0 107 16a1.5 1.5 0 000 3.5Z" />
        </svg>
      )
    case 'rocket':
      return (
        <svg viewBox="0 0 24 24" className={cn(common, className)} aria-hidden="true" fill="currentColor">
          <path d="M14.4 2.2a8.5 8.5 0 00-6.6 3.7L5 9.5l2.8 2.8 3.6-2.7a8.5 8.5 0 002.9-7.4ZM4 18l2-2 2 2-2 2a2 2 0 01-2-2Zm9.3-5.7-5.6 5.6a2 2 0 102.8 2.8l5.6-5.6a2 2 0 10-2.8-2.8Z" />
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
          <path d="M12 2a10 10 0 100 20v-2a8 8 0 110-16V2Zm3 11h-2.2a1.8 1.8 0 110-3.6H16V7h-2V5l-3 2 3 2v-1h-1.2a3 3 0 100 6H15v2l3-2-3-2v1Z" />
        </svg>
      )
    case 'stripe':
      // Pictogramme “carte/stripe” générique (pas un logo officiel)
      return (
        <svg viewBox="0 0 24 24" className={cn(common, className)} aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" className="fill-current opacity-15" />
          <rect x="3" y="8" width="18" height="3" className="fill-current opacity-60" />
          <rect x="6" y="14" width="5" height="2" className="fill-current opacity-80" />
          <rect x="13" y="14" width="5" height="2" className="fill-current opacity-40" />
        </svg>
      )
    case 'paypal':
      // Pictogramme “wallet/ppi” générique (pas un logo officiel)
      return (
        <svg viewBox="0 0 24 24" className={cn(common, className)} aria-hidden="true">
          <path d="M7 4h8a5 5 0 010 10H9l-1 6H5L7 4Z" className="fill-current opacity-85" />
          <path d="M9 8h6a2 2 0 010 4H9V8Z" className="fill-current opacity-40" />
        </svg>
      )
  }
}

function useDefaultBadges(): Badge[] {
  const t = useTranslations('trust_badges')
  return useMemo(
    () => [
      { icon: 'lock' as const, label: t('payment_secure'), sr: t('payment_secure_sr') },
      { icon: 'truck' as const, label: t('delivery_48_72'), sr: t('delivery_48_72_sr') },
      { icon: 'chat' as const, label: t('support'), sr: t('support_sr') },
      { icon: 'shield' as const, label: t('returns_30'), sr: t('returns_30_sr') },
    ],
    [t]
  )
}

function TrustBadges({
  badges,
  className,
  variant = 'card',
  compact = false,
}: TrustBadgesProps) {
  const t = useTranslations('trust_badges')
  const defaultBadges = useDefaultBadges()
  const resolvedBadges = badges ?? defaultBadges
  const prefersReduced = useReducedMotion()

  const base =
    'flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5 text-[13px] sm:text-sm font-medium text-[hsl(var(--text))] select-none min-h-[52px] sm:min-h-[56px]'
  const spacing = compact ? 'py-6' : 'py-8 sm:py-10'

  const variants: Record<NonNullable<TrustBadgesProps['variant']>, string> = {
    card: [
      'rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]',
      'shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-200',
    ].join(' '),
    pill: [
      'rounded-full border border-[hsl(var(--border))]/80 bg-[hsl(var(--surface))]/90 backdrop-blur-sm',
      'shadow-[var(--shadow-sm)] hover:border-[hsl(var(--border))] transition-colors duration-200',
    ].join(' '),
    subtle:
      'bg-transparent text-[hsl(var(--text))]/90',
    premium: [
      'relative rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]',
      'shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[hsl(var(--border))]',
      'transition-all duration-200 ease-[var(--ease-smooth)]',
    ].join(' '),
  }

  const items = useMemo(() => resolvedBadges.map((b) => ({ ...b })), [resolvedBadges])

  return (
    <section
      className={cn('border-t border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]/50', spacing, className)}
      aria-labelledby="trust-heading"
    >
      <h2 id="trust-heading" className="sr-only">
        {t('heading_sr')}
      </h2>

      <ul className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6" role="list">
        {items.map(({ icon, label, href, sr }, i) => {
          const content = (
            <div className={cn(base, variants[variant])} aria-label={label}>
              <Icon name={icon ?? 'shield'} className="text-[hsl(var(--accent))]" />

              <span className="relative z-10 truncate">{label}</span>
              {sr ? <span className="sr-only"> — {sr}</span> : null}
            </div>
          )

          return (
            <motion.li
              key={`${label}-${i}`}
              initial={prefersReduced ? false : { opacity: 0, y: 6 }}
              whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              whileHover={prefersReduced ? undefined : { y: -1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.25, ease: 'easeOut', delay: i * 0.04 }}
              className="relative list-none"
            >
              {href ? (
                <Link
                  href={href}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 rounded-xl"
                >
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
