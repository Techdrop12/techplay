// src/components/Tracking.tsx — Orchestrateur tracking (env-aware, idle mount) — FINAL+++
'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

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

// Petit helper “monte quand le thread est idle” pour préserver LCP
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

export default function Tracking() {
  if (DISABLED) return null

  // On monte Analytics si GA **ou** GTM est configuré
  const showAnalytics = Boolean(GA_ID || GTM_ID)
  const showMeta = Boolean(META_PIXEL_ID)
  const showHotjar = Boolean(HOTJAR_ID)
  const showClarity = Boolean(CLARITY_ID)

  return (
    <>
      {/* PWA SW registration (ne dépend pas du consentement) */}
      <Idle delay={0}><RegisterSW /></Idle>

      {showAnalytics && <Idle><Analytics /></Idle>}
      {showMeta && <Idle delay={150}><MetaPixel /></Idle>}
      {showHotjar && <Idle delay={300}><Hotjar /></Idle>}
      {showClarity && <Idle delay={450}><Clarity /></Idle>}
    </>
  )
}
