// src/components/MetaPixel.tsx — Consent-aware, SPA pageviews dedup, no double-init — FINAL++
'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { pixelPageView, isPixelReady } from '@/lib/meta-pixel' // garde ton API actuelle

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ''
const ENABLE_IN_DEV = (process.env.NEXT_PUBLIC_PIXEL_IN_DEV || '').toLowerCase() === 'true'

function hasAdsConsent(): boolean {
  try {
    // 1) Source de vérité injectée par layout.tsx
    const s: any = (window as any).__consentState || {}
    const adsGranted =
      (s.ad_storage !== 'denied') ||
      (s.ad_user_data !== 'denied') ||
      (s.ad_personalization !== 'denied')

    // 2) Fallback localStorage (bannière)
    const ls = localStorage.getItem('consent:ads') === '1'

    return adsGranted || ls
  } catch {
    return false
  }
}

function eligibleNow(): boolean {
  if (!PIXEL_ID) return false
  if (typeof window === 'undefined') return false

  // Respect DNT
  const dnt =
    (navigator as any).doNotTrack === '1' ||
    (window as any).doNotTrack === '1' ||
    (navigator as any).msDoNotTrack === '1'

  // Opt-out locaux
  let optedOut = false
  try {
    optedOut =
      localStorage.getItem('pixel:disabled') === '1' ||
      localStorage.getItem('analytics:disabled') === '1'
  } catch {}

  if (dnt || optedOut) return false
  if (process.env.NODE_ENV !== 'production' && !ENABLE_IN_DEV) return false

  // Consent pub requis
  if (!hasAdsConsent()) return false

  return true
}

export default function MetaPixel() {
  const pathname = usePathname() || '/'
  const [shouldLoad, setShouldLoad] = useState(false)
  const lastPathRef = useRef<string>('')

  // Évalue à l’arrivée
  useEffect(() => {
    setShouldLoad(eligibleNow())
  }, [])

  // Écoute mises à jour de consent (CMP -> CustomEvent('tp:consent', {detail:{...}}))
  useEffect(() => {
    const onConsent = () => {
      if (eligibleNow()) setShouldLoad(true)
    }
    window.addEventListener('tp:consent', onConsent as EventListener)
    window.addEventListener('consent_update', onConsent as EventListener) // émis par layout.tsx
    return () => {
      window.removeEventListener('tp:consent', onConsent as EventListener)
      window.removeEventListener('consent_update', onConsent as EventListener)
    }
  }, [])

  // SPA: PageView à chaque navigation (dedupe)
  useEffect(() => {
    if (!shouldLoad) return
    if (lastPathRef.current === pathname) return
    lastPathRef.current = pathname

    const fire = () => {
      if (isPixelReady()) {
        pixelPageView()
      } else {
        setTimeout(() => isPixelReady() && pixelPageView(), 0)
      }
    }
    fire()
  }, [pathname, shouldLoad])

  if (!shouldLoad) return null

  return (
    <>
      {/* Snippet officiel Meta Pixel (sans PageView auto) */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          (function(f,b,e,v,n,t,s){
            if (f.fbq) return;
            n=f.fbq=function(){n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)};
            if (!f._fbq) f._fbq=n; n.push=n; n.loaded=!0; n.version='2.0';
            n.queue=[]; t=b.createElement(e); t.async=!0;
            t.src=v; s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);
          })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          // Pas de 'PageView' ici : on le déclenche manuellement (SPA-friendly) via pixelPageView()
        `}
      </Script>

      {/* Noscript de courtoisie */}
      <noscript
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
            <img height="1" width="1" style="display:none"
                 src="https://www.facebook.com/tr?id=${encodeURIComponent(
                   PIXEL_ID
                 )}&ev=PageView&noscript=1"/>
          `,
        }}
      />
    </>
  )
}
