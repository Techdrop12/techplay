// src/components/Clarity.tsx — Consent-aware Clarity loader (SPA-safe)
'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? ''
const ENABLE_IN_DEV = process.env.NEXT_PUBLIC_CLARITY_IN_DEV === 'true'

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

  let consentAnalytics = '0'
  try {
    consentAnalytics = localStorage.getItem('consent:analytics') || '0'
  } catch {}

  if (dnt || optedOut) return false
  if (process.env.NODE_ENV !== 'production' && !ENABLE_IN_DEV) return false
  if (consentAnalytics !== '1') return false

  return true
}

export default function Clarity() {
  const pathname = usePathname() || '/'
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    setShouldLoad(eligibleNow())
  }, [])

  useEffect(() => {
    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      if (detail.analytics && eligibleNow()) setShouldLoad(true)
    }
    window.addEventListener('tp:consent', onConsent as EventListener)
    return () => window.removeEventListener('tp:consent', onConsent as EventListener)
  }, [])

  // Clarity auto-traque les SPA; rien à faire de plus
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
      `}
    </Script>
  )
}
