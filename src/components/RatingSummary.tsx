// src/components/RatingSummary.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import RatingStars from './RatingStars'

export interface RatingSummaryProps {
  average?: number
  total?: number
  /** Répartition par note (5→1). Ex: {5: 80, 4: 10, 3: 5, 2: 3, 1: 2} (en %) */
  breakdownPct?: Partial<Record<1|2|3|4|5, number>>
  className?: string
}

export default function RatingSummary({
  average = 0,
  total = 0,
  breakdownPct,
  className,
}: RatingSummaryProps) {
  const avg = Number.isFinite(average) ? average : 0
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <strong className="text-base">{avg.toFixed(1)} ★</strong>
        <RatingStars value={avg} editable={false} size={18} />
        <span>({total} avis)</span>
      </div>

      {breakdownPct ? (
        <div className="space-y-1">
          {[5,4,3,2,1].map((n) => {
            const pct = Math.max(0, Math.min(100, breakdownPct[n as 1|2|3|4|5] ?? 0))
            return (
              <div key={n} className="flex items-center gap-2">
                <span className="w-6 text-sm tabular-nums text-right">{n}</span>
                <div className="h-2 flex-1 rounded bg-gray-200 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 text-right text-xs tabular-nums">{pct.toFixed(0)}%</span>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
