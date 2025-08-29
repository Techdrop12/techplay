'use client'

import { useEffect, useMemo, useRef } from 'react'
import { logEvent } from '@/lib/ga'
import { trackPixel, isPixelReady } from '@/lib/meta-pixel'

type Props = {
  /** Nom d'événement GA4 (ex: 'add_to_cart', 'cta_click', 'purchase'...) */
  event: string
  /** Paramètres additionnels envoyés avec l'événement */
  params?: Record<string, unknown>
  /** N’émettre qu’une seule fois après montage (par défaut: true) */
  once?: boolean
  /**
   * Clé personnalisée pour la déduplication (par défaut: event + JSON(params)).
   * Utile si tu veux dédoublonner à l’écran plutôt qu’à la session entière.
   */
  onceKey?: string
  /** Pousser aussi dans dataLayer (utile pour GTM/tests) */
  fallbackToDataLayer?: boolean
  /** Emettre aussi vers Meta Pixel (si consent autorisé et Pixel prêt) */
  mirrorToMetaPixel?: boolean
}

/** Mapping basique GA4 -> Meta (tu peux l’enrichir au besoin) */
const META_EVENT_MAP: Record<string, string> = {
  page_view: 'PageView',
  view_item: 'ViewContent',
  add_to_cart: 'AddToCart',
  begin_checkout: 'InitiateCheckout',
  purchase: 'Purchase',
}

function canSendAds(): boolean {
  try {
    const c: any = (window as any).__consentState || {}
    // On considère qu'il faut au moins analytics_storage OU ad_storage pour certains envois,
    // et ad_user_data/ad_personalization pour Meta CAPI/personalisation.
    const analyticsOk = c.analytics_storage !== 'denied'
    const adsOk =
      c.ad_storage !== 'denied' || c.ad_user_data !== 'denied' || c.ad_personalization !== 'denied'
    return analyticsOk || adsOk
  } catch {
    return false
  }
}

function toOnceKey(evt: string, params?: Record<string, unknown>, custom?: string) {
  if (custom) return `cts:${custom}`
  const p = params ? JSON.stringify(params) : ''
  return `cts:${evt}:${p}`
}

/**
 * Déclenche un événement client de façon sûre :
 *  - utilise nos helpers GA4 (respect DNT / opt-out / offline queue)
 *  - optionnellement pousse dans dataLayer (GTM)
 *  - optionnellement miroite vers Meta Pixel (si prêt + consent)
 *  - déduplication simple via sessionStorage
 */
export default function ClientTrackingScript({
  event,
  params,
  once = true,
  onceKey,
  fallbackToDataLayer = true,
  mirrorToMetaPixel = true,
}: Props) {
  const fired = useRef(false)
  const key = useMemo(() => toOnceKey(event, params, onceKey), [event, params, onceKey])

  useEffect(() => {
    if (once) {
      if (fired.current) return
      if (typeof window !== 'undefined' && sessionStorage.getItem(key) === '1') return
    }
    fired.current = true

    // 1) GA4 (via lib/ga.ts) — SSR/DNT/queue-safe
    try {
      logEvent(event, params)
    } catch {}

    // 2) dataLayer fallback (GTM)
    if (fallbackToDataLayer) {
      try {
        ;(window as any).dataLayer = (window as any).dataLayer || []
        ;(window as any).dataLayer.push({ event, ...(params || {}) })
      } catch {}
    }

    // 3) Meta Pixel mirror (respect consent + readiness)
    if (mirrorToMetaPixel && canSendAds()) {
      try {
        const metaEvt = META_EVENT_MAP[event] || event
        if (isPixelReady && isPixelReady()) {
          trackPixel(metaEvt as any, params as any)
        } else {
          // petit retry light si fbq pas encore prêt
          setTimeout(() => {
            try {
              if (isPixelReady && isPixelReady()) {
                trackPixel(metaEvt as any, params as any)
              }
            } catch {}
          }, 800)
        }
      } catch {}
    }

    if (once && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(key, '1')
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]) // volontairement minimal pour éviter les multi-envois

  return null
}
