// src/components/Clarity.tsx — FINAL++++ (ConsentV2, revoke propre, SPA-safe, no double-init)
'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? ''
const ENABLE_IN_DEV = (process.env.NEXT_PUBLIC_CLARITY_IN_DEV || '').toLowerCase() === 'true'

function consentState() {
  try {
    const s: any = (window as any).__consentState || {}
    // normalise en 'granted' | 'denied'
    const ad = s.ad_storage === 'granted' ? 'granted' : 'denied'
    const analytics = s.analytics_storage === 'granted' ? 'granted' : 'denied'
    // fallback LS si dispo (bannière)
    const lsAnalytics = localStorage.getItem('consent:analytics') === '1'
    return {
      ad_Storage: (s.ad_storage === 'granted' ? 'granted' : (localStorage.getItem('consent:ads') === '1' ? 'granted' : 'denied')) as 'granted' | 'denied',
      analytics_Storage: (analytics === 'granted' || lsAnalytics) ? 'granted' : 'denied' as 'granted' | 'denied',
    }
  } catch {
    return { ad_Storage: 'denied' as const, analytics_Storage: 'denied' as const }
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
    optedOut = localStorage.getItem('clarity:disabled') === '1' || localStorage.getItem('analytics:disabled') === '1'
  } catch {}
  if (dnt || optedOut) return false
  if (process.env.NODE_ENV !== 'production' && !ENABLE_IN_DEV) return false
  // on préfère n’injecter que si analytics OK (Clarity peut fonctionner en no-consent, mais ici on reste strict)
  return consentState().analytics_Storage === 'granted'
}

export default function Clarity() {
  const pathname = usePathname() || '/'
  const [shouldLoad, setShouldLoad] = useState(false)
  const loadedRef = useRef(false)

  // Eligibilité au premier rendu
  useEffect(() => { setShouldLoad(eligibleNow()) }, [])

  // Réagit UNIQUEMENT à tp:consent (événement CustomEvent émis par la CMP)
  useEffect(() => {
    const onConsent = () => {
      const ok = eligibleNow()
      setShouldLoad(ok)
      // Si déjà chargé, propage ConsentV2 ou révoque proprement
      try {
        const cs = consentState()
        if ((window as any).clarity && typeof (window as any).clarity === 'function') {
          if (cs.ad_Storage === 'denied' && cs.analytics_Storage === 'denied') {
            // Révocation totale → efface cookies & stop jusqu’à nouveau consentement
            ;(window as any).clarity('consent', false)
          } else {
            // ConsentV2 recommandé
            ;(window as any).clarity('consentv2', cs)
          }
        }
      } catch {}
    }
    window.addEventListener('tp:consent', onConsent as EventListener)
    return () => window.removeEventListener('tp:consent', onConsent as EventListener)
  }, [])

  // Clarity gère les SPA, rien à faire ici (on garde le hook pour future extension)
  useEffect(() => {
    // no-op (placeholder)
  }, [pathname])

  if (!shouldLoad) return null

  return (
    <Script id="clarity" strategy="afterInteractive" onLoad={() => {
      loadedRef.current = true
      // signale l’état de consentement dès le chargement
      try { (window as any).clarity && (window as any).clarity('consentv2', consentState()) } catch {}
    }}>
      {`
        (function(c,l,a,r,i,t,y){
          if (c[a]) return; // idempotent
          c[a]=function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r); t.async=1; t.src="https://www.clarity.ms/tag/"+${JSON.stringify(CLARITY_ID)};
          y=l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script");
      `}
    </Script>
  )
}
