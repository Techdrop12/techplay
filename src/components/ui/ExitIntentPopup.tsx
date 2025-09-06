// src/components/ui/ExitIntentPopup.tsx — FINAL (fusion + robustesse)
'use client'

import Link from '@/components/LocalizedLink'
import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  /** Afficher seulement si le panier contient des items */
  requireCartItems?: boolean
  /** Masquer sur ces routes (prefix match) */
  hideOnRoutes?: string[]
  /** Ne pas ré-afficher pendant X jours (persistance) */
  ttlDays?: number
  /** Clé de persistance */
  storageKey?: string
  /** Y max déclenchement (<= 0 = bord haut) */
  triggerAtTopY?: number
  /** Masquer automatiquement après X ms (0 = jamais) */
  autoHideMs?: number
  /** Lien CTA */
  ctaHref?: string
  /** Texte du code promo (facultatif) */
  promoCode?: string
}

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'

export default function ExitIntentPopup({
  requireCartItems = true,
  hideOnRoutes = ['/checkout', '/commande', '/success'],
  ttlDays = 3,
  storageKey = 'exit_intent_until',
  triggerAtTopY = 0,
  autoHideMs = 10_000,
  ctaHref = '/commande',
  promoCode = 'WELCOME10',
}: Props) {
  const [open, setOpen] = useState(false)
  const [eligible, setEligible] = useState(!requireCartItems) // sera validé au mount
  const timerRef = useRef<number | null>(null)
  const shownOnce = useRef(false)

  // i18n light
  const isFr = useMemo(() => {
    if (!isBrowser()) return true
    const lang = document.documentElement.lang || 'fr'
    return lang.toLowerCase().startsWith('fr')
  }, [])

  // route guard
  const hiddenByRoute = useMemo(() => {
    if (!isBrowser()) return false
    const path = window.location?.pathname || ''
    return hideOnRoutes.some((p) => path.startsWith(p))
  }, [hideOnRoutes])

  // persistance
  const isDismissed = () => {
    if (!isBrowser()) return false
    try {
      const raw = localStorage.getItem(storageKey)
      const until = raw ? parseInt(raw, 10) : 0
      return Date.now() < until
    } catch {
      return false
    }
  }
  const persistDismiss = () => {
    if (!isBrowser()) return
    try {
      const until = Date.now() + ttlDays * 24 * 60 * 60 * 1000
      localStorage.setItem(storageKey, String(until))
    } catch {}
  }

  // lire le panier (fallback localStorage pour éviter la dépendance forte)
  useEffect(() => {
    if (!isBrowser() || !requireCartItems) return
    try {
      // essaie le localStorage `cart`
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setEligible(Array.isArray(cart) && cart.length > 0)
    } catch {
      setEligible(false)
    }
  }, [requireCartItems])

  // auto-hide
  useEffect(() => {
    if (!open || autoHideMs <= 0) return
    timerRef.current = window.setTimeout(() => setOpen(false), autoHideMs) as unknown as number
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [open, autoHideMs])

  // handler exit-intent (souris vers le haut / sortie fenêtre)
  useEffect(() => {
    if (!isBrowser() || hiddenByRoute || isDismissed() || !eligible) return

    const onMouseOut = (e: MouseEvent) => {
      // relatedTarget null = sortie du document
      const leavingDoc = !e.relatedTarget && e.clientY <= triggerAtTopY
      if (leavingDoc && !shownOnce.current) {
        shownOnce.current = true
        setOpen(true)
        // analytics (optionnel)
        try { (window as any).dataLayer?.push({ event: 'exit_intent_shown' }) } catch {}
        document.removeEventListener('mouseout', onMouseOut)
      }
    }

    // mobile: on ne déclenche pas (pas de curseur)
    const hasPointer = window.matchMedia?.('(pointer: fine)').matches ?? true
    if (!hasPointer) return

    document.addEventListener('mouseout', onMouseOut)
    return () => document.removeEventListener('mouseout', onMouseOut)
  }, [eligible, hiddenByRoute, triggerAtTopY])

  // ESC pour fermer
  useEffect(() => {
    if (!open || !isBrowser()) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => {
    setOpen(false)
    persistDismiss()
    try { (window as any).dataLayer?.push({ event: 'exit_intent_closed' }) } catch {}
  }

  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) close()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm"
      onMouseDown={onBackdrop}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-intent-title"
        aria-describedby="exit-intent-desc"
        className="mx-3 w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl outline-none dark:bg-zinc-900 dark:text-white border border-gray-200 dark:border-zinc-800"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 id="exit-intent-title" className="text-xl font-bold mb-2">
          {isFr ? 'Avant de partir…' : 'Before you go…'}
        </h3>
        <p id="exit-intent-desc" className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {isFr
            ? `Profitez de -10 % avec le code ${promoCode}`
            : `Enjoy -10% with code ${promoCode}`}
        </p>

        <div className="flex flex-col gap-2">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-lg bg-[hsl(var(--accent))] px-4 py-2 font-semibold text-white shadow hover:opacity-90"
            onClick={() => {
              persistDismiss()
              try { (window as any).dataLayer?.push({ event: 'exit_intent_cta_click' }) } catch {}
            }}
          >
            {isFr ? 'Voir mon panier →' : 'Go to cart →'}
          </Link>
          <button
            onClick={close}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-800"
          >
            {isFr ? 'Continuer mes achats' : 'Keep browsing'}
          </button>
        </div>
      </div>
    </div>
  )
}
