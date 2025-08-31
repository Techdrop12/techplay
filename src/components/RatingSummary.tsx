// src/components/RatingSummary.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import RatingStars from './RatingStars'

type Note = 1 | 2 | 3 | 4 | 5

export interface RatingSummaryProps {
  /** Moyenne de 0..5 (décimale possible) */
  average?: number
  /** Nombre total d’avis */
  total?: number
  /**
   * Répartition en POURCENTAGES (5→1). Ex: {5: 80, 4: 10, 3: 5, 2: 3, 1: 2}
   * Si `breakdownCount` est fourni, il prime et les % sont calculés à partir des comptes.
   */
  breakdownPct?: Partial<Record<Note, number>>
  /** Répartition en COMPTES (5→1). Ex: {5: 80, 4: 10, 3: 5, 2: 3, 1: 2} */
  breakdownCount?: Partial<Record<Note, number>>
  /** Couleur de barre (classe Tailwind) */
  barClassName?: string
  /** Afficher les barres de répartition */
  showBars?: boolean
  /** Injecte AggregateRating JSON-LD si fourni (SEO) */
  jsonLd?: { productSku?: string; productName?: string }
  className?: string
}

const order: Note[] = [5, 4, 3, 2, 1]

export default function RatingSummary({
  average = 0,
  total = 0,
  breakdownPct,
  breakdownCount,
  barClassName = 'bg-accent',
  showBars = true,
  jsonLd,
  className,
}: RatingSummaryProps) {
  const avg = Number.isFinite(average) ? average : 0
  const rounded = Math.round(avg * 10) / 10

  // Calcule des % à partir des comptes si disponibles, sinon utilise breakdownPct
  const pct: Record<Note, number> = React.useMemo(() => {
    const base: Record<Note, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    if (breakdownCount) {
      const sum = order.reduce((a, n) => a + (breakdownCount[n] ?? 0), 0)
      if (sum > 0) {
        for (const n of order) {
          base[n] = Math.round(((breakdownCount[n] ?? 0) / sum) * 100)
        }
        return base
      }
    }
    if (breakdownPct) {
      for (const n of order) base[n] = clamp0to100(breakdownPct[n] ?? 0)
    }
    return base
  }, [breakdownPct, breakdownCount])

  const jsonLdData =
    jsonLd && total > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          ...(jsonLd.productSku ? { sku: jsonLd.productSku } : {}),
          ...(jsonLd.productName ? { name: jsonLd.productName } : {}),
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rounded,
            reviewCount: total,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : null

  return (
    <div className={cn('space-y-2', className)}>
      {/* En-tête moyenne */}
      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <strong className="text-base tabular-nums">{rounded.toFixed(1)} ★</strong>
        <RatingStars value={avg} editable={false} size={18} ariaLabel={`Note moyenne ${rounded}/5`} />
        <span className="tabular-nums">({total} avis)</span>
      </div>

      {/* Barres */}
      {showBars && (
        <div className="space-y-1">
          {order.map((n) => {
            const v = pct[n] ?? 0
            return (
              <div key={n} className="flex items-center gap-2">
                <span className="w-6 text-sm tabular-nums text-right">{n}</span>
                <div
                  className="relative h-2 flex-1 rounded bg-gray-200 dark:bg-zinc-800 overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={v}
                  aria-label={`Part des notes ${n} étoiles`}
                >
                  <div className={cn('h-full transition-[width] duration-300', barClassName)} style={{ width: `${v}%` }} />
                </div>
                <span className="w-10 text-right text-xs tabular-nums" aria-hidden>
                  {v.toFixed(0)}%
                </span>
              </div>
            )
          })}
        </div>
      )}

      {jsonLdData && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      )}
    </div>
  )
}

function clamp0to100(n: number) {
  return Math.max(0, Math.min(100, n))
}
