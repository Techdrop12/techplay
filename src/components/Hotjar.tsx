// src/components/Hotjar.tsx — FINAL (Consent-aware, SPA stateChange, no double-init)
'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { eligibleHotjar, hjStateChange } from '@/lib/hotjar'

const HOTJAR_ID = Number(process.env.NEXT_PUBLIC_HOTJAR_ID ?? 0)
const HOTJAR_SV = Number(process.env.NEXT_PUBLIC_HOTJAR_SV ?? 6)

export default function Hotjar() {
  const pathname = usePathname() || '/'
  const [shouldLoad, setShouldLoad] = useState(false)

  // Éligible à l’arrivée
  useEffect(() => {
    setShouldLoad(eligibleHotjar(HOTJAR_ID))
  }, [])

  // Réagit aux changements de consentement (CustomEvent 'tp:consent')
  useEffect(() => {
    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      if (detail.analytics && eligibleHotjar(HOTJAR_ID)) {
        setShouldLoad(true)
      }
    }
    window.addEventListener('tp:consent', onConsent as EventListener)
    return () => window.removeEventListener('tp:consent', onConsent as EventListener)
  }, [])

  // SPA: notifier Hotjar sur changement de route
  useEffect(() => {
    if (!shouldLoad) return
    hjStateChange(pathname)
  }, [pathname, shouldLoad])

  if (!shouldLoad) return null

  return (
    <>
      {/* Init idempotente (ne ré-injecte pas si déjà présent) */}
      <Script id="hotjar-init" strategy="afterInteractive">
        {`
          (function(h,o,t,j,a,r){
            if (h.hj) return;
            h.hj=function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${HOTJAR_ID},hjsv:${HOTJAR_SV}};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script'); r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `}
      </Script>
    </>
  )
}
