// src/components/MetaPixel.tsx — FINAL (Consent-aware, SPA pageviews dedup, no double-init)
'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { pixelPageView, isPixelReady } from '@/lib/meta-pixel'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ''
const ENABLE_IN_DEV = process.env.NEXT_PUBLIC_PIXEL_IN_DEV === 'true'

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

  // Consent local (défini par Analytics.tsx / ta bannière)
  let consentAds = '0'
  try {
    consentAds = localStorage.getItem('consent:ads') || '0'
  } catch {}

  if (dnt || optedOut) return false
  if (process.env.NODE_ENV !== 'production' && !ENABLE_IN_DEV) return false
  if (consentAds !== '1') return false

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

  // Écoute les mises à jour de consentement (CustomEvent 'tp:consent' émis par ta bannière)
  useEffect(() => {
    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      // On (re)teste l’éligibilité dès que l’utilisateur consent aux pubs/analytics
      if ((detail.ads || detail.analytics) && eligibleNow()) {
        setShouldLoad(true)
      }
      // Si l’utilisateur refuse ensuite, on ne "décharge" pas le pixel (Meta ne prévoit pas d'API)
    }
    window.addEventListener('tp:consent', onConsent as EventListener)
    return () => window.removeEventListener('tp:consent', onConsent as EventListener)
  }, [])

  // SPA: track PageView à chaque navigation, quand le pixel est prêt (dedupe)
  useEffect(() => {
    if (!shouldLoad) return
    if (lastPathRef.current === pathname) return
    lastPathRef.current = pathname

    // Le snippet initialise fbq (stub) immédiatement ; si jamais il n'est pas prêt,
    // on tente à nouveau au prochain tick.
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
          // Pas de 'PageView' ici : on le fait manuellement (SPA-friendly).
        `}
      </Script>

      {/* Optionnel : balise noscript */}
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
