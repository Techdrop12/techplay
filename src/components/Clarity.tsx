// src/components/Clarity.tsx — Consent-aware Clarity loader (SPA-safe) — FINAL+++
'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? ''
const ENABLE_IN_DEV = (process.env.NEXT_PUBLIC_CLARITY_IN_DEV || '').toLowerCase() === 'true'

function hasAnalyticsConsent(): boolean {
  try {
    // Source de vérité posée dans <head> (layout.tsx)
    const s: any = (window as any).__consentState || {}
    const ok = s.analytics_storage !== 'denied'
    // Fallback local (bannière)
    const ls = localStorage.getItem('consent:analytics') === '1'
    return ok || ls
  } catch {
    return false
  }
}

function eligibleNow(): boolean {
  if (!CLARITY_ID) return false
  if (typeof window === 'undefined') return false

  const dnt =
    (navigator as any).doNotTrack === '1' ||
    (window as any).doNotTrack === '1' ||
    (navigator as any).msDoNotTrack === '1'

  let optedOut = false
  try {
    optedOut =
      localStorage.getItem('clarity:disabled') === '1' ||
      localStorage.getItem('analytics:disabled') === '1'
  } catch {}

  if (dnt || optedOut) return false
  if (process.env.NODE_ENV !== 'production' && !ENABLE_IN_DEV) return false
  if (!hasAnalyticsConsent()) return false

  return true
}

export default function Clarity() {
  const pathname = usePathname() || '/'
  const [shouldLoad, setShouldLoad] = useState(false)

  // Éligible à l’arrivée
  useEffect(() => {
    setShouldLoad(eligibleNow())
  }, [])

  // Réagit aux changements de consentement (CMP → 'tp:consent' et layout → 'consent_update')
  useEffect(() => {
    const recheck = () => {
      if (eligibleNow()) setShouldLoad(true)
    }
    window.addEventListener('tp:consent', recheck as EventListener)
    window.addEventListener('consent_update', recheck as EventListener)
    return () => {
      window.removeEventListener('tp:consent', recheck as EventListener)
      window.removeEventListener('consent_update', recheck as EventListener)
    }
  }, [])

  // Clarity auto-traque les SPA; rien à faire de plus ici
  if (!shouldLoad) return null

  return (
    <Script id="clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          if (c[a]) return;
          c[a]=function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r); t.async=1; t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_ID}");
        // Par sécurité, si l'API consent existe côté Clarity, on signale qu'il est OK
        try { window.clarity && window.clarity("consent"); } catch(e) {}
      `}
    </Script>
  )
}
