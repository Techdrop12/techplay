// src/components/Analytics.tsx — Ultra Premium FINAL (GA4 + Consent Mode v2)
'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { pageview } from '@/lib/ga'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ''
const ENABLE_IN_DEV = process.env.NEXT_PUBLIC_ANALYTICS_IN_DEV === 'true'
const DEBUG_MODE = process.env.NEXT_PUBLIC_GA_DEBUG === 'true'

export default function Analytics() {
  const pathname = usePathname() || '/'
  const search = useSearchParams()
  const shouldLoad = GA_ID && (process.env.NODE_ENV === 'production' || ENABLE_IN_DEV)

  // Pageview à chaque navigation (y compris changement de querystring)
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
      const gtag = (window as any).gtag as undefined | ((...args: any[]) => void)

      // valeurs par défaut prudentes
      const analytics = !!p.analytics
      const ads = !!p.ads
      const ad_user_data = p.ad_user_data ?? ads
      const ad_personalization = p.ad_personalization ?? ads
      const functionality = p.functionality ?? true

      gtag?.('consent', 'update', {
        analytics_storage: analytics ? 'granted' : 'denied',
        ad_storage: ads ? 'granted' : 'denied',
        ad_user_data: ad_user_data ? 'granted' : 'denied',
        ad_personalization: ad_personalization ? 'granted' : 'denied',
        functionality_storage: functionality ? 'granted' : 'denied',
        security_storage: 'granted',
      })

      try {
        localStorage.setItem('consent:analytics', analytics ? '1' : '0')
        localStorage.setItem('consent:ads', ads ? '1' : '0')
      } catch {}
    }

    ;(window as any).tpConsentUpdate = update

    // Optionnel : écoute un CustomEvent('tp:consent', {detail:{...}})
    const onEvt = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      update(detail)
    }
    window.addEventListener('tp:consent', onEvt as EventListener)

    return () => {
      delete (window as any).tpConsentUpdate
      window.removeEventListener('tp:consent', onEvt as EventListener)
    }
  }, [shouldLoad])

  if (!shouldLoad) return null

  return (
    <>
      {/* Loader GA4 (après interaction) */}
      <Script
        id="ga4-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`}
        strategy="afterInteractive"
      />

      {/* Init idempotente + DNT/opt-out + Consent Mode v2 par défaut (sécurisé) */}
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

            // Consent par défaut (sera mis à jour par la bannière)
            if (!window.__ga_consent_default) {
              gtag('consent', 'default', {
                ad_storage: 'denied',
                analytics_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                functionality_storage: 'granted',
                security_storage: 'granted',
                wait_for_update: 500
              });
              window.__ga_consent_default = true;
            }

            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              send_page_view: false,
              allow_google_signals: false,
              allow_ad_personalization_signals: false,
              debug_mode: ${DEBUG_MODE ? 'true' : 'false'},
              ads_data_redaction: true,
              page_path: location.pathname + location.search,
              page_title: document.title || undefined
            });
          })();
        `}
      </Script>
    </>
  )
}
