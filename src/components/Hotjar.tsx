// src/components/Hotjar.tsx — FINAL++++ (Consent-aware, CMP reactive, SPA stateChange, no double-init, strict revoke option)
'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { eligibleHotjar, hjStateChange } from '@/lib/hotjar'

const HOTJAR_ID = Number(process.env.NEXT_PUBLIC_HOTJAR_ID ?? 0)
const HOTJAR_SV = Number(process.env.NEXT_PUBLIC_HOTJAR_SV ?? 6)
const ENABLE_IN_DEV = (process.env.NEXT_PUBLIC_HOTJAR_IN_DEV || '').toLowerCase() === 'true'

// Si tu veux être ultra strict : reload quand l’utilisateur retire son consentement
const STRICT_RELOAD = (process.env.NEXT_PUBLIC_HOTJAR_STRICT_RELOAD || '').toLowerCase() === '1'

function hasAnalyticsConsent(): boolean {
  try {
    const s: any = (window as any).__consentState || {}
    const ok = s.analytics_storage !== 'denied'
    const ls = localStorage.getItem('consent:analytics') === '1'
    return ok || ls
  } catch { return false }
}

function eligibleNow(): boolean {
  if (!HOTJAR_ID) return false
  if (typeof window === 'undefined') return false
  const dnt =
    (navigator as any).doNotTrack === '1' ||
    (window as any).doNotTrack === '1' ||
    (navigator as any).msDoNotTrack === '1'
  let optedOut = false
  try {
    optedOut = localStorage.getItem('hotjar:disabled') === '1' || localStorage.getItem('analytics:disabled') === '1'
  } catch {}
  if (dnt || optedOut) return false
  if (process.env.NODE_ENV !== 'production' && !ENABLE_IN_DEV) return false
  if (!hasAnalyticsConsent()) return false
  return true
}

export default function Hotjar() {
  const pathname = usePathname() || '/'
  const [shouldLoad, setShouldLoad] = useState(false)
  const loadedRef = useRef(false)

  // Eligibilité au premier rendu
  useEffect(() => {
    const ok = (process.env.NODE_ENV === 'production' || ENABLE_IN_DEV) && eligibleHotjar(HOTJAR_ID) && eligibleNow()
    setShouldLoad(ok)
  }, [])

  // Réagit UNIQUEMENT au CustomEvent('tp:consent') (la bannière l’émet et Analytics relaie)
  useEffect(() => {
    const recheck = () => {
      const ok = eligibleNow()
      if (ok) {
        setShouldLoad(true)
      } else {
        setShouldLoad(false)
        if (loadedRef.current && STRICT_RELOAD) {
          try { location.reload() } catch {}
        }
      }
    }
    window.addEventListener('tp:consent', recheck as EventListener)
    return () => window.removeEventListener('tp:consent', recheck as EventListener)
  }, [])

  // SPA: notifier Hotjar à chaque changement de route
  useEffect(() => {
    if (!shouldLoad || !loadedRef.current) return
    hjStateChange(pathname)
  }, [pathname, shouldLoad])

  if (!shouldLoad) return null

  return (
    <Script id="hotjar-init" strategy="afterInteractive" onLoad={() => { loadedRef.current = true }}>
      {`
        (function(h,o,t,j,a,r){
          if (h.hj) return; // idempotent
          h.hj=function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${HOTJAR_ID},hjsv:${HOTJAR_SV}};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script'); r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
    </Script>
  )
}
