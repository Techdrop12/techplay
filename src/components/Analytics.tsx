// src/components/Analytics.tsx — GA4 + Consent Mode v2 (sans doublon), SPA-safe
'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { pageview, initAnalytics, consentUpdateBooleans } from '@/lib/ga'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ''
const ENABLE_IN_DEV = process.env.NEXT_PUBLIC_ANALYTICS_IN_DEV === 'true'
const DEBUG_MODE = process.env.NEXT_PUBLIC_GA_DEBUG === 'true'

export default function Analytics() {
  const pathname = usePathname() || '/'
  const search = useSearchParams()
  const shouldLoad = !!GA_ID && (process.env.NODE_ENV === 'production' || ENABLE_IN_DEV)

  // Pageview à chaque navigation (y compris querystring)
  useEffect(() => {
    if (!shouldLoad) return
    const qs = search?.toString() ? `?${search.toString()}` : ''
    const title = typeof document !== 'undefined' ? document.title : undefined
    pageview(`${pathname}${qs}`, title, { send_page_view: false })
  }, [pathname, search, shouldLoad])

  // Expose une API pour MAJ le consentement depuis ta bannière
  useEffect(() => {
    if (!shouldLoad) return

    const update = (p: {
      analytics?: boolean
      ads?: boolean
      ad_user_data?: boolean
      ad_personalization?: boolean
      functionality?: boolean
    }) => {
      consentUpdateBooleans(p)
      try {
        localStorage.setItem('consent:analytics', p.analytics ? '1' : '0')
        localStorage.setItem('consent:ads', p.ads ? '1' : '0')
      } catch {}
    }

    ;(window as any).tpConsentUpdate = update
    const onEvt = (e: Event) => update((e as CustomEvent).detail || {})
    window.addEventListener('tp:consent', onEvt as EventListener)

    return () => {
      delete (window as any).tpConsentUpdate
      window.removeEventListener('tp:consent', onEvt as EventListener)
    }
  }, [shouldLoad])

  // Initialise GA (config) une fois gtag présent
  useEffect(() => {
    if (!shouldLoad) return
    initAnalytics({
      disableSignals: true,
      nonPersonalizedAds: true,
      config: {
        debug_mode: DEBUG_MODE || undefined,
        ads_data_redaction: true,
        page_path: typeof location !== 'undefined' ? location.pathname + location.search : undefined,
        page_title: typeof document !== 'undefined' ? document.title : undefined,
        send_page_view: false,
      },
    })
  }, [shouldLoad])

  if (!shouldLoad) return null

  return (
    <>
      {/* Chargeur GA4 (après interaction) */}
      <Script
        id="ga4-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`}
        strategy="afterInteractive"
      />

      {/* Init minimale : plus de consent 'default' ici (déjà injecté dans app/layout.tsx) */}
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          (function() {
            if (window.__ga_inited) return;
            window.__ga_inited = true;

            var dnt = (navigator.doNotTrack === '1') || (window.doNotTrack === '1') || (navigator.msDoNotTrack === '1');
            var optedOut = false;
            try { optedOut = localStorage.getItem('ga:disabled') === '1' || localStorage.getItem('analytics:disabled') === '1'; } catch (e) {}
            var DISABLE_KEY = 'ga-disable-${GA_ID}';
            if (dnt || optedOut) { window[DISABLE_KEY] = true; }

            window.dataLayer = window.dataLayer || [];
            function gtag(){ window.dataLayer.push(arguments); }
            window.gtag = window.gtag || gtag;

            // Horodatage GA
            gtag('js', new Date());
            // ⚠️ Pas de 'config' ici : géré par initAnalytics() (lib/ga)
          })();
        `}
      </Script>
    </>
  )
}
