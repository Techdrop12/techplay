// src/components/Analytics.tsx — GA4 + Consent Mode v2, SPA-safe, sGTM-ready
'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { pageview, initAnalytics, consentUpdateBooleans } from '@/lib/ga'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ''
const ENABLE_IN_DEV = (process.env.NEXT_PUBLIC_ANALYTICS_IN_DEV || '').toLowerCase() === 'true'
const DEBUG_MODE = (process.env.NEXT_PUBLIC_GA_DEBUG || '').toLowerCase() === 'true'
const GTM_SERVER = (process.env.NEXT_PUBLIC_GTM_SERVER || '').replace(/\/+$/, '')

export default function Analytics() {
  const pathname = usePathname() || '/'
  const search = useSearchParams()
  const shouldLoad = !!GA_ID && (process.env.NODE_ENV === 'production' || ENABLE_IN_DEV)

  // SPA pageviews
  useEffect(() => {
    if (!shouldLoad) return
    const qs = search?.toString() ? `?${search.toString()}` : ''
    const title = typeof document !== 'undefined' ? document.title : undefined
    pageview(`${pathname}${qs}`, title, { send_page_view: false })
  }, [pathname, search, shouldLoad])

  // CMP / bannière → Consent Mode
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

  // GA init (après gtag ready)
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
        ...(GTM_SERVER ? { transport_url: GTM_SERVER } : {}),
      },
    })
  }, [shouldLoad])

  if (!shouldLoad) return null

  return (
    <>
      {/* Bootstrap consent AVANT gtag (défaut basé sur DNT/localStorage) */}
      <Script id="ga4-consent-bootstrap" strategy="beforeInteractive">
        {`
          (function() {
            var dnt = (navigator.doNotTrack === '1') || (window.doNotTrack === '1') || (navigator.msDoNotTrack === '1');
            var a = '0', ads = '0';
            try { a = localStorage.getItem('consent:analytics') || '0'; ads = localStorage.getItem('consent:ads') || '0'; } catch(e){}
            var analyticsGranted = (!dnt && a === '1');
            var adsGranted = (!dnt && ads === '1');
            window.__consentState = {
              analytics_storage: analyticsGranted ? 'granted' : 'denied',
              ad_storage: adsGranted ? 'granted' : 'denied',
              ad_user_data: adsGranted ? 'granted' : 'denied',
              ad_personalization: adsGranted ? 'granted' : 'denied',
              functionality_storage: 'granted',
              security_storage: 'granted'
            };
            window.__applyConsent = function(update){
              try {
                window.__consentState = Object.assign({}, window.__consentState, update || {});
                if (typeof window.gtag === 'function') window.gtag('consent','update', window.__consentState);
                window.dispatchEvent(new CustomEvent('tp:consent', { detail: window.__consentState }));
              } catch(e){}
            };
          })();
        `}
      </Script>

      {/* GA4 loader */}
      <Script
        id="ga4-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`}
        strategy="afterInteractive"
      />

      {/* gtag bootstrap */}
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          (function() {
            if (window.__ga_inited) return; window.__ga_inited = true;
            var dnt = (navigator.doNotTrack === '1') || (window.doNotTrack === '1') || (navigator.msDoNotTrack === '1');
            var DISABLE_KEY = 'ga-disable-${GA_ID}';
            var optedOut = false;
            try { optedOut = localStorage.getItem('ga:disabled') === '1' || localStorage.getItem('analytics:disabled') === '1'; } catch(e){}
            if (dnt || optedOut) { window[DISABLE_KEY] = true; }
            window.dataLayer = window.dataLayer || [];
            function gtag(){ window.dataLayer.push(arguments); }
            window.gtag = window.gtag || gtag;
            gtag('js', new Date());
            // Consent par défaut (déjà en window.__consentState) — on le pousse pour que GA respecte dès le départ
            try { gtag('consent','default', Object.assign({ wait_for_update: 500 }, window.__consentState || {})); } catch(e){}
          })();
        `}
      </Script>
    </>
  )
}
