// src/components/ScrollProgress.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ScrollProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Position de la barre */
  position?: 'top' | 'bottom'
  /** Hauteur en px */
  height?: number
  /** Classe de couleur du fill (ex: 'bg-accent') */
  barClassName?: string
  /** Container className */
  containerClassName?: string
}

export default function ScrollProgress({
  position = 'top',
  height = 3,
  barClassName = 'bg-accent',
  containerClassName,
  className,
  ...rest
}: ScrollProgressProps) {
  const [pct, setPct] = React.useState(0)
  const rafRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    const onScroll = () => {
      if (rafRef.current != null) return
      rafRef.current = window.requestAnimationFrame(() => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
        const y = Math.min(max, window.scrollY)
        setPct((y / max) * 100)
        rafRef.current && window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      className={cn(
        'fixed left-0 w-full z-50',
        position === 'top' ? 'top-0' : 'bottom-0',
        'bg-transparent',
        containerClassName
      )}
      role="presentation"
      {...rest}
    >
      <div
        aria-hidden="true"
        className={cn('transition-[width] duration-150 ease-out', barClassName, className)}
        style={{ width: `${pct}%`, height }}
      />
      <span className="sr-only" aria-live="polite">
        Progression du défilement : {Math.round(pct)} %
      </span>
    </div>
  )
}
