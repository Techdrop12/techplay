// src/components/Tracking.tsx — Orchestrateur tracking (consent-aware, idle mount) — FINAL++++
'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'

// Trackers (client-only)
const Analytics = dynamic(() => import('./Analytics'), { ssr: false })
const MetaPixel = dynamic(() => import('./MetaPixel'), { ssr: false })
const Hotjar = dynamic(() => import('./Hotjar'), { ssr: false })
const Clarity = dynamic(() => import('./Clarity'), { ssr: false })

// PWA SW registration (bonus)
const RegisterSW = dynamic(() => import('./RegisterSW').then(m => m.default), { ssr: false })

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID

// Désactive tout si explicitement demandé (ex: previews, debug)
const DISABLED = (process.env.NEXT_PUBLIC_ANALYTICS_DISABLED || '').toLowerCase() === 'true'

/* -------------------------------- Idle wrapper ------------------------------- */
function Idle({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let t = window.setTimeout(() => setReady(true), delay || 0)
    const ric = (window as any).requestIdleCallback
    if (typeof ric === 'function') {
      ric(() => {
        window.clearTimeout(t)
        setReady(true)
      })
    }
    return () => window.clearTimeout(t)
  }, [delay])
  return ready ? <>{children}</> : null
}

/* ------------------------------- Consent hook --------------------------------
   Lit window.__consentState (défini dans app/layout.tsx), fallback localStorage,
   écoute l’event CustomEvent('tp:consent', {detail:{ analytics, ads, ... }})
   ET wrappe window.__applyConsent pour capter toute MAJ consent.
----------------------------------------------------------------------------- */
type ConsentBooleans = { analytics: boolean; ads: boolean }

function readInitialConsent(): ConsentBooleans {
  try {
    const s: any = (window as any).__consentState || {}
    const analytics =
      s.analytics_storage === 'granted'
    const ads =
      s.ad_storage === 'granted' ||
      s.ad_user_data === 'granted' ||
      s.ad_personalization === 'granted'

    // Fallback bannière (persistée par Analytics.tsx)
    const lsA = localStorage.getItem('consent:analytics') === '1'
    const lsAds = localStorage.getItem('consent:ads') === '1'

    return {
      analytics: analytics || lsA,
      ads: ads || lsAds,
    }
  } catch {
    return { analytics: false, ads: false }
  }
}

export default function Tracking() {
  if (DISABLED) return null

  const [consent, setConsent] = useState<ConsentBooleans>(() =>
    typeof window === 'undefined' ? { analytics: false, ads: false } : readInitialConsent()
  )

  // garde-fou: ne wrap qu'une fois
  const wrappedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const apply = (next: any) => {
      // si l’event vient en booleans (CMP → Analytics.tsx → tp:consent)
      if (typeof next?.analytics === 'boolean' || typeof next?.ads === 'boolean') {
        setConsent((prev) => ({
          analytics: typeof next.analytics === 'boolean' ? next.analytics : prev.analytics,
          ads: typeof next.ads === 'boolean' ? next.ads : prev.ads,
        }))
        return
      }
      // sinon on mappe depuis le format Consent Mode
      const analytics = next?.analytics_storage === 'granted'
      const ads =
        next?.ad_storage === 'granted' ||
        next?.ad_user_data === 'granted' ||
        next?.ad_personalization === 'granted'
      setConsent({ analytics, ads })
    }

    // 1) Event de la bannière
    const onEvt = (e: Event) => apply((e as CustomEvent).detail || {})
    window.addEventListener('tp:consent', onEvt as EventListener)

    // 2) Wrap __applyConsent défini dans Root layout
    if (!wrappedRef.current) {
      wrappedRef.current = true
      try {
        const w: any = window as any
        const orig = w.__applyConsent
        if (typeof orig === 'function') {
          w.__applyConsent = function (next: any) {
            try { apply(next) } catch {}
            return orig.apply(this, arguments as any)
          }
        }
      } catch {}
    }

    // 3) Sync initial tardif (au cas où __consentState arrive après)
    const sync = () => {
      try {
        setConsent(readInitialConsent())
      } catch {}
    }
    const id = window.setTimeout(sync, 300)

    return () => {
      window.removeEventListener('tp:consent', onEvt as EventListener)
      window.clearTimeout(id)
    }
  }, [])

  // On monte Analytics si GA **ou** GTM est configuré — mais seulement si consent.analytics
  const canAnalytics = useMemo(() => Boolean((GA_ID || GTM_ID) && consent.analytics), [consent.analytics])
  const canMeta = useMemo(() => Boolean(META_PIXEL_ID && consent.ads), [consent.ads])
  const canHotjar = useMemo(() => Boolean(HOTJAR_ID && consent.analytics), [consent.analytics])
  const canClarity = useMemo(() => Boolean(CLARITY_ID && consent.analytics), [consent.analytics])

  return (
    <>
      {/* PWA SW registration (ne dépend pas du consentement) */}
      <Idle delay={0}><RegisterSW /></Idle>

      {canAnalytics && <Idle><Analytics /></Idle>}
      {canMeta && <Idle delay={150}><MetaPixel /></Idle>}
      {canHotjar && <Idle delay={300}><Hotjar /></Idle>}
      {canClarity && <Idle delay={450}><Clarity /></Idle>}
    </>
  )
}
