// src/components/RatingStars.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface RatingStarsProps {
  /** Note courante (peut être décimale, ex: 3.5) */
  value: number
  /** Nombre d’étoiles */
  max?: number
  /** Éditable (radio group clavier + clic/hover) */
  editable?: boolean
  /** Callback quand la note change */
  onChange?: (value: number) => void
  /** Granularité d’édition (1 ou 0.5) */
  step?: 1 | 0.5
  /** Taille en px (icone) */
  size?: number
  /** Classe des étoiles remplies / vides */
  filledClassName?: string
  emptyClassName?: string
  /** Classe du conteneur */
  className?: string
  /** Libellé a11y custom */
  ariaLabel?: string
  /** Désactivé */
  disabled?: boolean
}

const STAR_PATH = 'M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.163L12 18.896 4.665 23.16l1.401-8.163L.132 9.21l8.2-1.192L12 .587z'

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export default function RatingStars({
  value,
  max = 5,
  editable = false,
  onChange,
  step = 1,
  size = 20,
  filledClassName = 'text-yellow-400',
  emptyClassName = 'text-gray-300 dark:text-gray-600',
  className,
  ariaLabel,
  disabled,
}: RatingStarsProps) {
  const safe = clamp(Number.isFinite(value) ? value : 0, 0, max)
  const groupLabel = ariaLabel ?? `Note : ${safe} sur ${max}`
  const [hoverValue, setHoverValue] = React.useState<number | null>(null)
  const current = hoverValue ?? safe
  const uid = React.useId()

  const applyChange = (v: number) => {
    if (!editable || disabled) return
    onChange?.(clamp(step === 1 ? Math.round(v) : Math.round(v * 2) / 2, 0, max))
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!editable || disabled) return
    const delta = step === 1 ? 1 : 0.5
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      applyChange(clamp(safe + delta, 0, max))
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      applyChange(clamp(safe - delta, 0, max))
    } else if (e.key === 'Home') {
      e.preventDefault()
      applyChange(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      applyChange(max)
    } else if (e.key === 'Enter' || e.key === ' ') {
      // confirme la valeur hover sinon laisse safe
      if (hoverValue != null) {
        e.preventDefault()
        applyChange(hoverValue)
      }
    }
  }

  return (
    <div
      role={editable ? 'radiogroup' : 'img'}
      aria-label={groupLabel}
      className={cn('inline-flex items-center gap-1', className)}
      onKeyDown={onKeyDown}
      aria-disabled={disabled || undefined}
    >
      {Array.from({ length: max }, (_, i) => {
        const index = i + 1
        // % de remplissage de cette étoile (0 → 100)
        const fillPct = clamp((current - i) * 100, 0, 100)

        const StarSvg = (
          <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            aria-hidden="true"
            className="block"
          >
            {/* fond vide */}
            <path d={STAR_PATH} className={emptyClassName} fill="currentColor" />
            {/* remplissage partiel via clip rect */}
            <defs>
              <clipPath id={`clip-${uid}-${i}`}>
                <rect x="0" y="0" width={`${fillPct}%`} height="100%" />
              </clipPath>
            </defs>
            <path
              d={STAR_PATH}
              className={filledClassName}
              fill="currentColor"
              clipPath={`url(#clip-${uid}-${i})`}
            />
          </svg>
        )

        if (!editable) {
          return <span key={i}>{StarSvg}</span>
        }

        // Éditable : bouton radio visuel + a11y
        const checked = Math.round(safe * 2) / 2 === index || (step === 1 && Math.round(safe) === index)

        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={`${index} étoile${index > 1 ? 's' : ''}`}
            disabled={disabled}
            className={cn(
              'rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
            )}
            onMouseEnter={() => setHoverValue(index)}
            onMouseLeave={() => setHoverValue(null)}
            onFocus={() => setHoverValue(index)}
            onBlur={() => setHoverValue(null)}
            onClick={() => applyChange(index)}
          >
            {StarSvg}
          </button>
        )
      })}
    </div>
  )
}
