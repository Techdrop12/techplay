// src/components/Spinner.tsx
'use client'

import * as React from 'react'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type SizeToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Taille en px ou token ('md' par défaut) */
  size?: number | SizeToken
  /** Épaisseur du trait (auto si token) */
  thickness?: number
  /** Libellé a11y (screen readers) */
  label?: string
  /** Centre le spinner dans un conteneur flex (avec padding) */
  center?: boolean
}

const SIZE_PX: Record<SizeToken, number> = { xs: 16, sm: 20, md: 28, lg: 36, xl: 48 }
const SIZE_STROKE: Record<SizeToken, number> = { xs: 2, sm: 2, md: 3, lg: 4, xl: 5 }

export default function Spinner({
  size = 'md',
  thickness,
  label = 'Chargement…',
  center = false,
  className,
  ...rest
}: SpinnerProps) {
  const px = typeof size === 'number' ? Math.max(12, size) : SIZE_PX[size]
  const stroke =
    thickness ??
    (typeof size === 'number' ? Math.max(2, Math.round(px / 12)) : SIZE_STROKE[size])

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn(
        center
          ? 'flex items-center justify-center py-10'
          : 'inline-flex items-center justify-center',
        className
      )}
      {...rest}
    >
      <svg
        className="animate-spin motion-reduce:animate-none"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}
