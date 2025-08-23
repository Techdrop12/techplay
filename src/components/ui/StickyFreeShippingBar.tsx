// src/components/ui/StickyFreeShippingBar.tsx — FINAL
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import FreeShippingBadge from '@/components/FreeShippingBadge'

type Position = 'bottom' | 'top'

type Props = {
  /** Seuil d’activation (fallback env -> 50€) */
  threshold?: number
  /** Délai d’apparition si pas de scroll (ms) */
  autoShowDelayMs?: number
  /** Position d’apparition après scroll (px) */
  minScrollY?: number
  /** Clé de persistance pour le dismiss (localStorage) */
  dismissKey?: string
  /** Routes où la barre est cachée */
  hideOnRoutes?: string[]
  /** Position de la barre (bottom par défaut) */
  position?: Position
  /** Afficher quand panier vide ? (par défaut false) */
  showOnEmptyCart?: boolean
  /** Afficher même lorsque le seuil est atteint ? (par défaut true) */
  showWhenReached?: boolean
  /** URL et libellé du CTA */
  ctaHref?: string
  ctaLabel?: string
  /** Lien vers conditions d’expédition (passé à FreeShippingBadge) */
  policyHref?: string
  className?: string
}

export default function StickyFreeShippingBar({
  threshold = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 50),
  autoShowDelayMs = 4000,
  minScrollY = 120,
  dismissKey = 'freeShippingBarDismissed',
  hideOnRoutes = ['/commande', '/checkout', '/success'],
  position = 'bottom',
  showOnEmptyCart = false,
  showWhenReached = true,
  ctaHref = '/commande',
  ctaLabel,
  policyHref,
  className,
}: Props) {
  const pathname = usePathname()
  const { cart } = useCart() as any

  // ── State
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const shownOnceRef = useRef(false)

  // ── Persist dismiss
  useEffect(() => {
    try {
      if (localStorage.getItem(dismissKey) === '1') setDismissed(true)
    } catch {}
  }, [dismissKey])

  const onClose = () => {
    try {
      localStorage.setItem(dismissKey, '1')
      ;(window as any).dataLayer?.push({ event: 'free_shipping_bar_close' })
    } catch {}
    setVisible(false)
    setDismissed(true)
  }

  // ── Hide by route
  const hiddenByRoute = useMemo(
    () => hideOnRoutes.some((r) => pathname?.startsWith(r)),
    [pathname, hideOnRoutes]
  )

  // ── Subtotal (robuste)
  const subtotal: number = useMemo(() => {
    if (!Array.isArray(cart)) return 0
    return cart.reduce((sum: number, it: any) => {
      const price = Number(it?.price ?? it?.unitPrice ?? it?.product?.price ?? 0)
      const qty = Number(it?.quantity ?? it?.qty ?? 1)
      const p = Number.isFinite(price) ? price : 0
      const q = Number.isFinite(qty) ? qty : 1
      return sum + p * q
    }, 0)
  }, [cart])

  const remaining = Math.max(threshold - subtotal, 0)
  const reached = remaining === 0

  // ── Scroll + auto show (RAF)
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

    const timer = window.setTimeout(() => setVisible(true), autoShowDelayMs)

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [autoShowDelayMs, minScrollY, hiddenByRoute, dismissed])

  // ── Track first show
  useEffect(() => {
    if (visible && !shownOnceRef.current) {
      shownOnceRef.current = true
      try {
        ;(window as any).dataLayer?.push({
          event: 'free_shipping_bar_show',
          reached,
          subtotal,
          threshold,
        })
      } catch {}
    }
  }, [visible, reached, subtotal, threshold])

  // ── Locale & libellés
  const locale =
    typeof document !== 'undefined' ? document.documentElement.lang || 'fr-FR' : 'fr-FR'
  const isFr = String(locale).toLowerCase().startsWith('fr')
  const labelCart = ctaLabel ?? (isFr ? 'Voir le panier' : 'View cart')

  // ── Conditions d’affichage
  if (dismissed || hiddenByRoute || !visible) return null
  if (!showOnEmptyCart && subtotal <= 0) return null
  if (!showWhenReached && reached) return null

  // ── Render
  const sideClasses =
    position === 'bottom'
      ? 'left-0 right-0 bottom-0 pb-[calc(env(safe-area-inset-bottom,0)+8px)] pt-2'
      : 'left-0 right-0 top-0 pt-[calc(env(safe-area-inset-top,0)+8px)] pb-2'

  return (
    <div
      className={cn('fixed z-50 px-3 sm:px-4', sideClasses, className)}
      role="region"
      aria-label={isFr ? 'Barre livraison offerte' : 'Free shipping bar'}
      data-position={position}
    >
      <div
        className={cn(
          'mx-auto max-w-5xl rounded-xl shadow-lg border',
          'bg-white/90 dark:bg-zinc-900/90 border-gray-200 dark:border-zinc-800',
          'supports-[backdrop-filter]:backdrop-blur-lg'
        )}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2">
          {/* Badge + progression (centralise toute la logique d’éligibilité) */}
          <FreeShippingBadge
            price={subtotal}
            threshold={threshold}
            withProgress
            variant="bar"
            policyHref={policyHref}
            persistKey="free_shipping_reached_session"
          />

          <div className="flex items-center gap-2">
            <Link
              href={ctaHref}
              className={cn(
                'hidden sm:inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold shadow',
                reached
                  ? 'bg-emerald-600 text-white hover:bg-emerald-600/90'
                  : 'bg-[hsl(var(--accent))] text-white hover:opacity-90'
              )}
              aria-label={labelCart}
              onClick={() => {
                try {
                  ;(window as any).dataLayer?.push({
                    event: 'free_shipping_bar_cta',
                    reached,
                  })
                } catch {}
              }}
            >
              {labelCart}
            </Link>

            <button
              onClick={onClose}
              aria-label={isFr ? 'Fermer la barre' : 'Close bar'}
              className="rounded-full px-2 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--accent))]"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
