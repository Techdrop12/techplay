// src/components/RatingStars.tsx
'use client'

import {
  useRef,
  useState,
  useCallback,
  useMemo,
  type KeyboardEvent,
  type MouseEvent,
  type TouchEvent,
} from 'react'
import { cn } from '@/lib/utils'

export type SizeToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface RatingStarsProps {
  /** Note courante (peut être décimale, ex: 3.5) */
  value: number
  /** Nombre d’étoiles */
  max?: number
  /** Éditable (clavier + souris/touch) */
  editable?: boolean
  /** Callback quand la note change */
  onChange?: (value: number) => void
  /** Granularité d’édition (1 ou 0.5) */
  step?: 1 | 0.5
  /** Taille en px ou token */
  size?: number | SizeToken
  /** Classe des étoiles remplies / vides (thème) */
  filledClassName?: string
  emptyClassName?: string
  /** Classe du conteneur */
  className?: string
  /** Libellé a11y custom */
  ariaLabel?: string
  /** Désactivé */
  disabled?: boolean
  /** Afficher la valeur "(4,5/5)" à droite */
  showValue?: boolean
  /** (option) Ne pas focus en lecture seule */
  noFocusWhenReadOnly?: boolean
}

const SIZE_PX: Record<SizeToken, number> = { xs: 14, sm: 16, md: 20, lg: 24, xl: 32 }
const toPx = (s?: number | SizeToken) => (typeof s === 'number' ? s : SIZE_PX[s ?? 'md'])

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const roundToStep = (v: number, step: 1 | 0.5) => (step === 1 ? Math.round(v) : Math.round(v * 2) / 2)

function Star({
  px,
  fillPercent,
  emptyClassName,
  filledClassName,
}: {
  px: number
  fillPercent: number
  emptyClassName: string
  filledClassName: string
}) {
  const Path = (
    <path
      d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.163L12 18.896 4.665 23.16l1.401-8.163L.132 9.21l8.2-1.192L12 .587z"
      vectorEffect="non-scaling-stroke"
    />
  )

  return (
    <span className="relative inline-block align-middle" style={{ width: px, height: px }} aria-hidden="true">
      {/* fond vide */}
      <svg width={px} height={px} viewBox="0 0 24 24" className={cn('block', emptyClassName)}>
        <g fill="currentColor">{Path}</g>
      </svg>

      {/* remplissage partiel via clip inline (pas de defs/id) */}
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        className={cn('absolute inset-0', filledClassName)}
        style={{ clipPath: `inset(0 ${100 - fillPercent}% 0 0)` }}
      >
        <g fill="currentColor">{Path}</g>
      </svg>
    </span>
  )
}

export default function RatingStars({
  value,
  max = 5,
  editable = false,
  onChange,
  step = 1,
  size = 'md',
  filledClassName = 'text-amber-500',
  emptyClassName = 'text-zinc-300 dark:text-zinc-600',
  className,
  ariaLabel,
  disabled,
  showValue = false,
  noFocusWhenReadOnly,
}: RatingStarsProps) {
  const px = toPx(size)
  const committed = clamp(Number.isFinite(value) ? value : 0, 0, max)

  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const current = hoverValue ?? committed
  const rounded = Math.round(current * 10) / 10

  // Ref sur la "piste" des étoiles (exclut le texte showValue pour un calcul précis)
  const trackRef = useRef<HTMLDivElement | null>(null)

  const perStarFill = useMemo(
    () => Array.from({ length: max }, (_, i) => Math.round(clamp(current - i, 0, 1) * 100)),
    [current, max],
  )

  const computeFromPointer = useCallback(
    (clientX: number) => {
      const el = trackRef.current
      if (!el) return committed
      const rect = el.getBoundingClientRect()
      const x = clamp(clientX - rect.left, 0, rect.width)
      const ratio = rect.width ? x / rect.width : 0
      const raw = ratio * max
      const snapped = roundToStep(raw, step)
      return clamp(snapped, 0, max)
    },
    [max, step, committed],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!editable || disabled) return
      setHoverValue(computeFromPointer(e.clientX))
    },
    [editable, disabled, computeFromPointer],
  )
  const handleMouseLeave = useCallback(() => {
    if (!editable || disabled) return
    setHoverValue(null)
  }, [editable, disabled])
  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!editable || disabled) return
      const next = computeFromPointer(e.clientX)
      onChange?.(next)
      setHoverValue(null)
    },
    [editable, disabled, computeFromPointer, onChange],
  )
  const handleTouch = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (!editable || disabled) return
      const t = e.touches[0]
      if (!t) return
      const next = computeFromPointer(t.clientX)
      setHoverValue(next)
      e.preventDefault()
    },
    [editable, disabled, computeFromPointer],
  )

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!editable || disabled) return
      let next = committed
      const delta = step === 1 ? 1 : 0.5
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        next = committed + delta
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        next = committed - delta
      } else if (e.key === 'Home') {
        next = 0
      } else if (e.key === 'End') {
        next = max
      } else if (e.key === ' ' || e.key === 'Enter') {
        // Confirme la valeur "hover" si présente
        next = hoverValue ?? committed
      } else {
        return
      }
      e.preventDefault()
      onChange?.(clamp(roundToStep(next, step), 0, max))
    },
    [editable, disabled, committed, step, max, onChange, hoverValue],
  )

  const sliderAria =
    editable && !disabled
      ? {
          role: 'slider' as const,
          'aria-label': ariaLabel ?? 'Choisir une note',
          'aria-valuemin': 0,
          'aria-valuemax': max,
          'aria-valuenow': Math.round(committed * 10) / 10,
          'aria-valuetext': `${Math.round(committed * 10) / 10} sur ${max}`,
          tabIndex: 0,
        }
      : {
          role: 'img' as const,
          'aria-label': ariaLabel ?? `Note : ${rounded} sur ${max}`,
          tabIndex: noFocusWhenReadOnly ? -1 : 0,
        }

  return (
    <div
      className={cn('inline-flex select-none items-center gap-2', className)}
      title={`${rounded}/${max}`}
      onKeyDown={onKeyDown}
      aria-readonly={!editable || undefined}
      aria-disabled={disabled || undefined}
      {...sliderAria}
    >
      {/* piste des étoiles (seule zone interactive pointeur) */}
      <div
        ref={trackRef}
        className="inline-flex items-center gap-1"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={() => editable && setHoverValue(null)}
      >
        {perStarFill.map((fill, i) => (
          <Star
            key={i}
            px={px}
            fillPercent={fill}
            emptyClassName={emptyClassName!}
            filledClassName={filledClassName!}
          />
        ))}
      </div>

      {showValue && (
        <span
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          aria-live="polite"
          aria-atomic="true"
        >
          ({rounded.toLocaleString(undefined, { maximumFractionDigits: 1 })}/{max})
        </span>
      )}
    </div>
  )
}
