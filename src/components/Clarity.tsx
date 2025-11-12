// src/components/Clarity.tsx — FINAL++++ (ConsentV2, revoke propre, SPA-safe, no double-init)
'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? ''
const ENABLE_IN_DEV = (process.env.NEXT_PUBLIC_CLARITY_IN_DEV || '').toLowerCase() === 'true'

function consentState() {
  try {
    const s: unknown = (window as unknown).__consentState || {}
    const analyticsGranted = s.analytics_storage === 'granted' || localStorage.getItem('consent:analytics') === '1'
    const adsGranted =
      s.ad_storage === 'granted' ||
      s.ad_user_data === 'granted' ||
      s.ad_personalization === 'granted' ||
      localStorage.getItem('consent:ads') === '1'
    return {
      ad_storage: adsGranted ? 'granted' as const : 'denied' as const,
      analytics_storage: analyticsGranted ? 'granted' as const : 'denied' as const,
    }
  } catch {
    return { ad_storage: 'denied' as const, analytics_storage: 'denied' as const }
  }
}

function eligibleNow(): boolean {
  if (!CLARITY_ID) return false
  if (typeof window === 'undefined') return false
  const dnt =
    (navigator as unknown).doNotTrack === '1' ||
    (window as unknown).doNotTrack === '1' ||
    (navigator as unknown).msDoNotTrack === '1'
  let optedOut = false
  try {
    optedOut = localStorage.getItem('clarity:disabled') === '1' || localStorage.getItem('analytics:disabled') === '1'
  } catch {}
  if (dnt || optedOut) return false
  if (process.env.NODE_ENV !== 'production' && !ENABLE_IN_DEV) return false
  return consentState().analytics_storage === 'granted'
}

export default function Clarity() {
  const pathname = usePathname() || '/'
  const [shouldLoad, setShouldLoad] = useState(false)
  const loadedRef = useRef(false)

  useEffect(() => { setShouldLoad(eligibleNow()) }, [])

  useEffect(() => {
    const onConsent = () => {
      const ok = eligibleNow()
      setShouldLoad(ok)
      try {
        const cs = consentState()
        if ((window as unknown).clarity && typeof (window as unknown).clarity === 'function') {
          if (cs.ad_storage === 'denied' && cs.analytics_storage === 'denied') {
            (window as unknown).clarity('consent', false)
          } else {
            (window as unknown).clarity('consentv2', cs)
          }
        }
      } catch {}
    }
    window.addEventListener('tp:consent', onConsent as EventListener)
    return () => window.removeEventListener('tp:consent', onConsent as EventListener)
  }, [])

  useEffect(() => {}, [pathname])

  if (!shouldLoad) return null

  return (
    <Script id="clarity" strategy="afterInteractive" onLoad={() => {
      loadedRef.current = true
      try { (window as unknown).clarity && (window as unknown).clarity('consentv2', consentState()) } catch {}
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

