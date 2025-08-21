'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface BannerPromoProps {
  message?: string
  variant?: 'brand' | 'yellow' | 'gray'
  dismissKey?: string
  showCloseButton?: boolean
  autoHideAfterMs?: number
  className?: string
  /** Fixe en haut (collant sous le header) */
  sticky?: boolean
}

export default function BannerPromo({
  message = '🚚 Livraison offerte dès 50 € d’achat – Profitez-en maintenant !',
  variant = 'brand',
  dismissKey = 'promoDismissed',
  showCloseButton = true,
  autoHideAfterMs,
  className,
  sticky = false,
}: BannerPromoProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(dismissKey)) setVisible(false)
    } catch {}
  }, [dismissKey])

  useEffect(() => {
    if (!autoHideAfterMs) return
    const timer = setTimeout(() => setVisible(false), autoHideAfterMs)
    return () => clearTimeout(timer)
  }, [autoHideAfterMs])

  const handleClose = useCallback(() => {
    try {
      sessionStorage.setItem(dismissKey, '1')
    } catch {}
    setVisible(false)
  }, [dismissKey])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    if (visible) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, handleClose])

  if (!visible) return null

  const variantStyles: Record<typeof variant, string> = {
    brand: 'bg-brand text-white dark:bg-zinc-900 dark:text-white',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  }

  return (
    <div
      className={cn(
        'w-full px-4 py-2 text-sm text-center flex justify-center items-center gap-3 transition-all duration-300 animate-[fadeIn_.35s_ease-out] z-[65]',
        variantStyles[variant],
        sticky && 'sticky top-0',
        className
      )}
      role="region"
      aria-label="Promotion"
    >
      <span className="truncate">{message}</span>

      {showCloseButton && (
        <button
          onClick={handleClose}
          className="underline text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent hover:opacity-75 transition rounded"
          aria-label="Fermer la bannière promotionnelle"
        >
          Fermer
        </button>
      )}
    </div>
  )
}
