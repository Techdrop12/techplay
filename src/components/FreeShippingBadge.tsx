'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn, formatPrice } from '@/lib/utils'

interface FreeShippingBadgeProps {
  /** Montant pris en compte (ex: prix produit OU total panier) */
  price: number
  /** Seuil de livraison gratuite (fallback env or 49€) */
  threshold?: number
  className?: string
  /** Version compacte (pas de barre de progression) */
  minimal?: boolean
  /** Forcer l’affichage de la progression (ignoré si minimal) */
  withProgress?: boolean
  /** Locale pour le texte (affichage identique fr-FR mais prévu) */
  locale?: string
}

export default function FreeShippingBadge({
  price,
  threshold = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 49),
  className,
  minimal = false,
  withProgress = !minimal,
  locale = 'fr-FR',
}: FreeShippingBadgeProps) {
  const prefersReducedMotion = useReducedMotion()

  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) return null
  if (!Number.isFinite(threshold) || threshold <= 0) return null

  const isEligible = price >= threshold
  const remaining = Math.max(0, threshold - price)
  const progress = Math.min(100, Math.round((price / threshold) * 100))

  const baseStyle =
    'inline-flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded-lg transition shadow-sm'
  const eligibleStyle =
    'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300 border border-green-200/70 dark:border-green-700/40'
  const alertStyle =
    'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200/60 dark:border-yellow-700/40'

  const content = isEligible
    ? (minimal ? '✅ Livraison offerte' : '🚚 Livraison gratuite')
    : `Encore ${formatPrice(remaining)} pour la livraison gratuite`

  return (
    <div className={cn('inline-flex flex-col min-w-[10rem]', className)}>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        role={isEligible ? 'status' : 'alert'}
        aria-live="polite"
        className={cn(baseStyle, isEligible ? eligibleStyle : alertStyle)}
      >
        <span aria-hidden="true">{isEligible ? '✅' : '🚚'}</span>
        <span>{content}</span>
      </motion.div>

      {/* Barre de progression (optionnelle) */}
      {!isEligible && withProgress && (
        <div
          className="mt-1 h-1.5 w-full rounded-full bg-gray-200/80 dark:bg-zinc-800/80 overflow-hidden"
          role="progressbar"
          aria-label="Progression vers la livraison gratuite"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Texte SR supplémentaire pour lecteurs d’écran */}
      {!isEligible && (
        <span className="sr-only" role="status" aria-live="polite">
          Il manque {formatPrice(remaining)} pour atteindre la livraison gratuite sur un seuil de{' '}
          {formatPrice(threshold)}.
        </span>
      )}
    </div>
  )
}
