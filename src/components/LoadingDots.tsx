// src/components/LoadingDots.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface LoadingDotsProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Libellé a11y (screen readers) */
  label?: string
  /** Nombre de points (2–5 recommandé) */
  count?: number
  /** Décalage entre les points (ms) */
  delayStepMs?: number
  /** Classe appliquée à chaque point */
  dotClassName?: string
}

export default function LoadingDots({
  className,
  label = 'Chargement…',
  count = 3,
  delayStepMs = 150,
  dotClassName,
  ...rest
}: LoadingDotsProps) {
  const dots = Array.from({ length: Math.max(2, Math.min(5, count)) })
  return (
    <span
      className={cn('inline-flex items-baseline space-x-1 align-middle', className)}
      role="status"
      aria-live="polite"
      {...rest}
    >
      {dots.map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn('animate-bounce', dotClassName)}
          style={{ animationDelay: `${i * delayStepMs}ms` }}
        >
          •
        </span>
      ))}
      <span className="sr-only">{label}</span>
    </span>
  )
}
