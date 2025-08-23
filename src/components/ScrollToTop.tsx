// src/components/ScrollToTop.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ScrollToTopProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Seuil d’apparition en pixels (par défaut 320) */
  threshold?: number
  /** Position: classes utilitaires Tailwind (ex: 'bottom-6 right-6') */
  positionClassName?: string
  /** Texte a11y */
  ariaLabel?: string
  /** Active le mode plein contraste */
  highContrast?: boolean
}

export default function ScrollToTop({
  threshold = 320,
  positionClassName = 'bottom-6 right-6',
  ariaLabel = 'Remonter en haut',
  highContrast = false,
  className,
  ...props
}: ScrollToTopProps) {
  const [visible, setVisible] = React.useState(false)
  const rafRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    const onScroll = () => {
      if (rafRef.current != null) return
      rafRef.current = window.requestAnimationFrame(() => {
        setVisible(window.scrollY > threshold)
        rafRef.current && window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // état initial
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [threshold])

  if (!visible) return null

  const scrollTop = () => {
    // Respecte reduce-motion
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollTop}
      className={cn(
        'fixed z-50 inline-grid h-11 w-11 place-items-center rounded-full shadow-lg outline-none transition',
        'focus-visible:ring-2 focus-visible:ring-accent',
        highContrast
          ? 'bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90'
          : 'bg-accent text-white hover:bg-accent/90',
        positionClassName,
        className
      )}
      aria-label={ariaLabel}
      title={ariaLabel}
      {...props}
    >
      {/* Icône flèche (inline, pas de dépendance) */}
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M12 5l7 7-1.4 1.4L13 8.8V20h-2V8.8L6.4 13.4 5 12z" fill="currentColor" />
      </svg>
    </button>
  )
}
