// src/components/ui/ExitIntentPopup.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import Link from '@/components/LocalizedLink'

type Props = {
  requireCartItems?: boolean
  hideOnRoutes?: string[]
  ttlDays?: number
  storageKey?: string
  triggerAtTopY?: number
  autoHideMs?: number
  ctaHref?: string
  promoCode?: string
}

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'

function pushDL(event: string, extra?: Record<string, unknown>) {
  try {
    window.dataLayer = window.dataLayer ?? []
    window.dataLayer.push({ event, ...(extra ?? {}) })
  } catch {}
}

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
  const [eligible, setEligible] = useState(!requireCartItems)
  const timerRef = useRef<number | null>(null)
  const shownOnce = useRef(false)

  const isFr = useMemo(() => {
    if (!isBrowser()) return true
    const lang = document.documentElement.lang || 'fr'
    return lang.toLowerCase().startsWith('fr')
  }, [])

  const hiddenByRoute = useMemo(() => {
    if (!isBrowser()) return false
    const path = window.location.pathname || ''
    return hideOnRoutes.some((route) => path.startsWith(route))
  }, [hideOnRoutes])

  const isDismissed = () => {
    if (!isBrowser()) return false
    try {
      const raw = localStorage.getItem(storageKey)
      const until = raw ? Number.parseInt(raw, 10) : 0
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

  useEffect(() => {
    if (!isBrowser() || !requireCartItems) return

    try {
      const parsed = JSON.parse(localStorage.getItem('cart') || '[]')
      const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : []
      setEligible(items.length > 0)
    } catch {
      setEligible(false)
    }
  }, [requireCartItems])

  useEffect(() => {
    if (!open || autoHideMs <= 0) return

    timerRef.current = window.setTimeout(() => setOpen(false), autoHideMs)

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [open, autoHideMs])

  useEffect(() => {
    if (!isBrowser() || hiddenByRoute || isDismissed() || !eligible) return

    const hasFinePointer = window.matchMedia?.('(pointer: fine)').matches ?? true
    if (!hasFinePointer) return

    const onMouseOut = (e: MouseEvent) => {
      const leavingDocument = !e.relatedTarget && e.clientY <= triggerAtTopY

      if (leavingDocument && !shownOnce.current) {
        shownOnce.current = true
        setOpen(true)
        pushDL('exit_intent_shown')
        document.removeEventListener('mouseout', onMouseOut)
      }
    }

    document.addEventListener('mouseout', onMouseOut)
    return () => document.removeEventListener('mouseout', onMouseOut)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- isDismissed read in body only
  }, [eligible, hiddenByRoute, triggerAtTopY])

  const close = () => {
    setOpen(false)
    persistDismiss()
    pushDL('exit_intent_closed')
  }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- close stable
  }, [open])

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
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
        className="mx-3 w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 text-center shadow-[var(--shadow-lg)] outline-none"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 id="exit-intent-title" className="mb-2 text-xl font-bold">
          {isFr ? 'Avant de partir…' : 'Before you go…'}
        </h3>

        <p id="exit-intent-desc" className="mb-4 text-[15px] text-token-text/75">
          {isFr
            ? `Profitez de -10 % avec le code ${promoCode}`
            : `Enjoy -10% with code ${promoCode}`}
        </p>

        <div className="flex flex-col gap-2">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-[15px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-md)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            onClick={() => {
              persistDismiss()
              pushDL('exit_intent_cta_click')
            }}
          >
            {isFr ? 'Voir mon panier →' : 'Go to cart →'}
          </Link>

          <button
            type="button"
            onClick={close}
            className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-2.5 text-[13px] font-medium transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          >
            {isFr ? 'Continuer mes achats' : 'Keep browsing'}
          </button>
        </div>
      </div>
    </div>
  )
}