'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface BannerPromoProps {
  message?: string
  variant?: 'brand' | 'yellow' | 'gray'
  dismissKey?: string
  showCloseButton?: boolean
  autoHideAfterMs?: number
  className?: string
}

export default function BannerPromo({
  message = '🚚 Livraison offerte dès 50 € d’achat – Profitez-en maintenant !',
  variant = 'brand',
  dismissKey = 'promoDismissed',
  showCloseButton = true,
  autoHideAfterMs,
  className,
}: BannerPromoProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const dismissed = sessionStorage.getItem(dismissKey)
    if (dismissed) setVisible(false)
  }, [dismissKey])

  useEffect(() => {
    if (autoHideAfterMs) {
      const timer = setTimeout(() => setVisible(false), autoHideAfterMs)
      return () => clearTimeout(timer)
    }
  }, [autoHideAfterMs])

  const handleClose = () => {
    sessionStorage.setItem(dismissKey, '1')
    setVisible(false)
  }

  if (!visible) return null

  const variantStyles: Record<string, string> = {
    brand: 'bg-brand text-white dark:bg-zinc-900',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  }

  return (
    <div
      className={cn(
        'w-full px-4 py-2 text-sm text-center flex justify-center items-center gap-2 transition-all duration-300',
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      <span>{message}</span>
      {showCloseButton && (
        <button
          onClick={handleClose}
          className="underline text-xs hover:opacity-75 transition"
          aria-label="Fermer la bannière promotionnelle"
        >
          Fermer
        </button>
      )}
    </div>
  )
}
