// src/components/LoadingOverlay.tsx
'use client'

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { cn } from '@/lib/utils'
import Spinner from './Spinner'

export interface LoadingOverlayProps {
  /** Affiche/masque l’overlay */
  show?: boolean
  /** Alias rétro-compat */
  isLoading?: boolean
  /** Fullscreen (true) sinon se cale sur un parent en position relative */
  fullscreen?: boolean
  /** Applique un blur sur le backdrop */
  blur?: boolean
  /** Couleur du backdrop */
  backdrop?: 'dark' | 'light' | 'transparent'
  /** z-index util (ex: z-[100]) */
  zIndexClassName?: string
  /** Contenu custom (sinon Spinner centré) */
  children?: React.ReactNode
  /** Props passés au Spinner par défaut */
  spinnerProps?: import('./Spinner').SpinnerProps
  /** Portail container (sinon body) */
  container?: HTMLElement | null
  /** Classes supplémentaires sur l’overlay */
  className?: string
  /** Bloque le scroll body quand visible */
  lockScroll?: boolean
  /** Callback clic sur le backdrop */
  onBackdropClick?: () => void
}

export default function LoadingOverlay({
  show,
  isLoading,
  fullscreen = true,
  blur = true,
  backdrop = 'dark',
  zIndexClassName = 'z-[100]',
  children,
  spinnerProps,
  container,
  className,
  lockScroll = true,
  onBackdropClick,
}: LoadingOverlayProps) {
  const visible = show ?? isLoading
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  // Lock scroll body
  React.useEffect(() => {
    if (!mounted || !visible || !lockScroll) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mounted, visible, lockScroll])

  if (!visible || !mounted) return null

  const node = (
    <div
      className={cn(
        'inset-0 grid place-items-center',
        fullscreen ? 'fixed' : 'absolute',
        zIndexClassName,
        backdrop === 'transparent'
          ? 'bg-transparent'
          : backdrop === 'dark'
          ? 'bg-black/50'
          : 'bg-white/75',
        blur && 'backdrop-blur-sm',
        'motion-safe:transition-opacity motion-safe:duration-200',
        className
      )}
      role="status"
      aria-live="polite"
      onClick={onBackdropClick}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {children ?? <Spinner center {...spinnerProps} />}
      </div>
    </div>
  )

  return ReactDOM.createPortal(node, container ?? document.body)
}
