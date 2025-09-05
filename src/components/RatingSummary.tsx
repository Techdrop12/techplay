// src/components/RatingSummary.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import RatingStars from '@/components/RatingStars'

type Note = 1 | 2 | 3 | 4 | 5
export interface RatingSummaryProps {
  /** Moyenne de 0..5 (décimale possible) */
  average?: number
  /** Nombre total d’avis */
  total?: number
  /**
   * Répartition en POURCENTAGES (5→1). Ex: {5: 80, 4: 10, 3: 5, 2: 3, 1: 2}
   * Si `breakdownCount` est fourni, il prime et les % sont calculés à partir des comptes (avec somme=100).
   */
  breakdownPct?: Partial<Record<Note, number>>
  /** Répartition en COMPTES (5→1). Ex: {5: 80, 4: 10, 3: 5, 2: 3, 1: 2} */
  breakdownCount?: Partial<Record<Note, number>>
  /** Couleur de barre (classe Tailwind) */
  barClassName?: string
  /** Afficher les barres de répartition */
  showBars?: boolean
  /** Injecte AggregateRating JSON-LD si fourni (SEO) */
  jsonLd?: { productSku?: string; productName?: string; id?: string }
  className?: string
}

const order: Note[] = [5, 4, 3, 2, 1]
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
const clamp0to100 = (n: number) => clamp(n, 0, 100)

/** Normalise un tableau de pourcentages pour que la somme fasse exactement 100 (répartition du reliquat). */
function normalizeTo100(values: number[]): number[] {
  if (values.length === 0) return values
  const sum = values.reduce((a, b) => a + b, 0)
  if (!isFinite(sum) || sum <= 0) return values.map(() => 0)

  const raw = values.map((v) => (v / sum) * 100)
  const floors = raw.map((v) => Math.floor(v))
  let rest = 100 - floors.reduce((a, b) => a + b, 0)

  // Indices triés par plus gros résidu décimal
  const byResidue = raw
    .map((v, i) => [i, v - floors[i]] as const)
    .sort((a, b) => b[1] - a[1])
    .map(([i]) => i)

  let idx = 0
  while (rest > 0 && byResidue.length > 0) {
    floors[byResidue[idx % byResidue.length]] += 1
    idx++
    rest--
  }
  return floors
}

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
  const avg = clamp(Number.isFinite(average) ? average : 0, 0, 5)
  const rounded = Math.round(avg * 10) / 10

  // Pourcentages finalisés (somme = 100 si des données existent)
  const pct: Record<Note, number> = React.useMemo(() => {
    const base: Record<Note, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

    // 1) Source "comptes" → on calcule des % précis puis on normalise
    if (breakdownCount) {
      const counts = order.map((n) => Math.max(0, breakdownCount[n] ?? 0))
      const sum = counts.reduce((a, b) => a + b, 0)
      if (sum > 0) {
        const normalized = normalizeTo100(counts.map((c) => (c / sum) * 100))
        order.forEach((n, i) => (base[n] = normalized[i]))
        return base
      }
    }

    // 2) Source "pourcentages" → clamp + normalisation
    if (breakdownPct) {
      const values = order.map((n) => clamp0to100(breakdownPct[n] ?? 0))
      const normalized = normalizeTo100(values)
      order.forEach((n, i) => (base[n] = normalized[i]))
      return base
    }

    return base
  }, [breakdownPct, breakdownCount])

  const jsonLdData =
    jsonLd && total > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          ...(jsonLd.id ? { '@id': jsonLd.id } : {}),
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
        <span className="tabular-nums">
          ({(total ?? 0).toLocaleString()} avis)
        </span>
      </div>

      {/* Barres */}
      {showBars && Object.values(pct).some((v) => v > 0) && (
        <div className="space-y-1">
          {order.map((n) => {
            const v = pct[n] ?? 0
            const labelId = `rating-label-${n}`
            return (
              <div key={n} className="flex items-center gap-2">
                <span id={labelId} className="w-6 text-sm tabular-nums text-right">
                  {n}
                </span>
                <div
                  className="relative h-2 flex-1 rounded bg-gray-200 dark:bg-zinc-800 overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={v}
                  aria-labelledby={labelId}
                >
                  <div
                    className={cn('h-full transition-[width] duration-300', barClassName)}
                    style={{ width: `${v}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs tabular-nums" aria-hidden="true">
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
