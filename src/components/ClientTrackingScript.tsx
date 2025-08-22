'use client'

import { useEffect, useRef } from 'react'
import { logEvent } from '@/lib/ga'

type Props = {
  /** Nom d'événement GA4 (ex: 'add_to_cart', 'cta_click', ...) */
  event: string
  /** Paramètres additionnels envoyés avec l'événement */
  params?: Record<string, unknown>
  /** N’émettre qu’une seule fois après montage (par défaut: true) */
  once?: boolean
  /** Pousser aussi dans dataLayer (utile pour GTM/tests) */
  fallbackToDataLayer?: boolean
}

/**
 * Déclenche un événement client de façon sûre :
 * - utilise nos helpers GA4 (respect DNT / opt-out / offline queue)
 * - optionnellement pousse dans dataLayer en fallback
 */
export default function ClientTrackingScript({
  event,
  params,
  once = true,
  fallbackToDataLayer = true,
}: Props) {
  const fired = useRef(false)

  useEffect(() => {
    if (once && fired.current) return
    fired.current = true

    try {
      // GA4 (via lib/ga.ts) — SSR/DNT-safe
      logEvent(event, params)
    } catch {}

    if (fallbackToDataLayer) {
      try {
        ;(window as any).dataLayer = (window as any).dataLayer || []
        ;(window as any).dataLayer.push({ event, ...(params || {}) })
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]) // volontairement minimal pour éviter les multi-envois

  return null
}
