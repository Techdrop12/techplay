'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'

type Props = {
  /** Seuil d’activation de la livraison offerte (en €) */
  threshold?: number
  /** Délai d’apparition si pas de scroll (ms) */
  autoShowDelayMs?: number
  /** Position d’apparition après scroll (px) */
  minScrollY?: number
  /** Clé de persistance pour le dismiss */
  dismissKey?: string
  /** Routes où la barre est cachée */
  hideOnRoutes?: string[]
  className?: string
}

export default function StickyFreeShippingBar({
  threshold = 50,
  autoShowDelayMs = 4000,
  minScrollY = 120,
  dismissKey = 'freeShippingBarDismissed',
  hideOnRoutes = ['/commande', '/checkout', '/success'],
  className,
}: Props) {
  const pathname = usePathname()
  const { cart } = useCart() as any

  // ————— ETAT
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // ————— PERSIST DISMISS
  useEffect(() => {
    try {
      if (localStorage.getItem(dismissKey) === '1') setDismissed(true)
    } catch {}
  }, [dismissKey])

  const onClose = () => {
    try {
      localStorage.setItem(dismissKey, '1')
    } catch {}
    setVisible(false)
    setDismissed(true)
  }

  // ————— MASQUAGE SUR CERTAINES ROUTES
  const hiddenByRoute = useMemo(
    () => hideOnRoutes.some((r) => pathname?.startsWith(r)),
    [pathname, hideOnRoutes]
  )

  // ————— SCROLL + AUTO SHOW (perf avec RAF)
  const ticking = useRef(false)
  useEffect(() => {
    if (hiddenByRoute || dismissed) return

    const check = () => {
      const y = window.scrollY
      setVisible((v) => v || y > minScrollY)
      ticking.current = false
    }
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(check)
        ticking.current = true
      }
    }

    // timer auto-show
    const timer = window.setTimeout(() => setVisible(true), autoShowDelayMs)

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [autoShowDelayMs, minScrollY, hiddenByRoute, dismissed])

  // ————— CALCUL DU PANIER (subtotal sécurisé)
  const subtotal: number = useMemo(() => {
    if (!Array.isArray(cart)) return 0
    return cart.reduce((sum: number, it: any) => {
      const price = Number(it?.price ?? 0)
      const qty = Number(it?.quantity ?? 1)
      return sum + price * qty
    }, 0)
  }, [cart])

  const remaining = Math.max(threshold - subtotal, 0)
  const reached = remaining === 0
  const progress = Math.min(subtotal / threshold, 1)

  // ————— FORMAT €
  const formatPrice = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

  // ————— CACHE GLOBAL
  if (dismissed || hiddenByRoute || !visible) return null

  return (
    <div
      className={cn(
        'fixed left-0 right-0 bottom-0 z-50',
        'px-3 sm:px-4 pb-[calc(env(safe-area-inset-bottom,0)+8px)] pt-2',
        className
      )}
      role="region"
      aria-label="Barre livraison offerte"
    >
      <div
        className={cn(
          'mx-auto max-w-5xl rounded-xl shadow-lg border',
          'bg-white/90 dark:bg-zinc-900/90 border-gray-200 dark:border-zinc-800',
          'supports-[backdrop-filter]:backdrop-blur-lg'
        )}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2">
          <p
            className={cn(
              'text-sm sm:text-base font-semibold',
              reached ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-100'
            )}
          >
            {reached ? (
              <>🎉 Livraison gratuite activée !</>
            ) : (
              <>
                📦 Plus que <span className="text-accent">{formatPrice(remaining)}</span> pour la
                livraison gratuite.
              </>
            )}
          </p>

          <div className="flex items-center gap-2">
            <Link
              href="/commande"
              className={cn(
                'hidden sm:inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold shadow',
                reached
                  ? 'bg-emerald-600 text-white hover:bg-emerald-600/90'
                  : 'bg-accent text-white hover:bg-accent/90'
              )}
              aria-label="Voir mon panier"
            >
              Voir le panier
            </Link>

            <button
              onClick={onClose}
              aria-label="Fermer la barre livraison gratuite"
              className="rounded-full px-2 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Barre de progression accessible */}
        <div className="px-3 sm:px-4 pb-3">
          <div
            className="h-2 w-full rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label="Progression vers la livraison gratuite"
          >
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-500 ease-out',
                reached ? 'bg-emerald-500' : 'bg-accent'
              )}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
