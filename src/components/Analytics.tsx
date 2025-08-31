// src/components/Analytics.tsx — GA4 + Consent Mode v2, SPA-safe, sGTM-ready — FINAL
'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { pageview, initAnalytics, consentUpdateBooleans } from '@/lib/ga'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ''
const ENABLE_IN_DEV = (process.env.NEXT_PUBLIC_ANALYTICS_IN_DEV || '').toLowerCase() === 'true'
const DEBUG_MODE = (process.env.NEXT_PUBLIC_GA_DEBUG || '').toLowerCase() === 'true'
const GTM_SERVER = (process.env.NEXT_PUBLIC_GTM_SERVER || '').replace(/\/+$/, '') // ex: https://gtm.techplay.com

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

  // API publique pour MAJ consent (bannière/CMP -> CustomEvent('tp:consent', {detail:{...}}))
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
      // Propage aussi à une éventuelle API utilitaire injectée en <head> (layout.tsx)
      try {
        if (typeof (window as any).__applyConsent === 'function') {
          ;(window as any).__applyConsent({
            analytics_storage: p.analytics ? 'granted' : 'denied',
            ad_storage: p.ads ? 'granted' : 'denied',
            ad_user_data: (p.ad_user_data ?? p.ads) ? 'granted' : 'denied',
            ad_personalization: (p.ad_personalization ?? p.ads) ? 'granted' : 'denied',
            functionality_storage: (p.functionality ?? true) ? 'granted' : 'denied',
            security_storage: 'granted',
          })
        }
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

  // Initialise GA une fois gtag présent (inclut transport_url pour sGTM si défini)
  useEffect(() => {
    if (!shouldLoad) return
    initAnalytics({
      disableSignals: true,
      nonPersonalizedAds: true,
      config: {
        debug_mode: DEBUG_MODE || undefined,
        ads_data_redaction: true,
        page_path:
          typeof location !== 'undefined' ? location.pathname + location.search : undefined,
        page_title: typeof document !== 'undefined' ? document.title : undefined,
        send_page_view: false,
        ...(GTM_SERVER ? { transport_url: GTM_SERVER } : {}), // ✅ envoie via ton serveur GTM
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

      {/* Init minimale (consent 'default' peut être aussi injecté dans app/layout.tsx) */}
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          (function() {
            if (window.__ga_inited) return; window.__ga_inited = true;

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
