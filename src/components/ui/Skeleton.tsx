// src/components/ui/Skeleton.tsx
import type { CSSProperties, HTMLAttributes } from 'react'

type Variant = 'rect' | 'text' | 'circle' | 'image'

type SkeletonProps = {
  variant?: Variant
  /** lignes pour le variant "text" */
  lines?: number
  /** px si nombre, ex: 160 ; ou classe tailwind ex: 'h-10' */
  height?: number | string
  /** idem pour width */
  width?: number | string
  /** bordures arrondies tailwind (ex: 'rounded-xl') */
  radiusClass?: string
  /** désactiver l’animation si besoin */
  animate?: boolean
  /** a11y */
  label?: string
  /** style inline supplémentaire */
  style?: CSSProperties
  className?: string
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>

function cx(...arr: Array<string | false | null | undefined>) {
  return arr.filter(Boolean).join(' ')
}
function toPx(v?: number | string) {
  if (v === undefined) return undefined
  return typeof v === 'number' ? `${v}px` : v
}

export default function Skeleton({
  variant = 'rect',
  lines = 3,
  height,
  width,
  radiusClass = 'rounded-md',
  animate = true,
  label = 'Chargement…',
  className,
  style,
  ...rest
}: SkeletonProps) {
  const base = 'bg-zinc-200 dark:bg-zinc-700'
  const anim = animate ? 'animate-pulse motion-reduce:animate-none' : ''
  const common = cx(base, anim, radiusClass, className)

  if (variant === 'text') {
    const rows = Math.max(1, lines)
    return (
      <div role="status" aria-live="polite" aria-label={label} className="space-y-2" {...rest}>
        {Array.from({ length: rows }).map((_, i) => {
          // variations de largeur pour un rendu plus naturel
          const w =
            width ??
            (i % 3 === 0 ? 'w-5/6' : i % 3 === 1 ? 'w-2/3' : 'w-full')
          return (
            <div
              key={i}
              className={cx(common, typeof w === 'string' ? w : '')}
              style={{ height: toPx(height ?? 16), width: typeof w === 'number' ? toPx(w) : undefined }}
              aria-hidden="true"
            />
          )
        })}
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  if (variant === 'circle') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label}
        className={cx(common, 'rounded-full')}
        style={{ height: toPx(height ?? 48), width: toPx(width ?? height ?? 48), ...style }}
        {...rest}
      >
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  // rect / image
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={common}
      style={{ height: toPx(height ?? (variant === 'image' ? 192 : 16)), width: toPx(width ?? '100%'), ...style }}
      {...rest}
    >
      <span className="sr-only">{label}</span>
    </div>
  )
}
