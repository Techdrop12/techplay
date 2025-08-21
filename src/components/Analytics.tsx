// src/components/Analytics.tsx
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

  if (!shouldLoad) return null

  return (
    <>
      <Script
        id="ga4-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`}
        strategy="afterInteractive"
      />

      {/* Init idempotent + DNT/opt-out + Consent Mode v2 par défaut (sécurité) */}
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

            // Consent default (doublé par prudence même si déjà posé dans <head>)
            if (!window.__ga_consent_default) {
              gtag('consent', 'default', {
                ad_storage: 'denied',
                analytics_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                wait_for_update: 500
              });
              window.__ga_consent_default = true;
            }

            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              send_page_view: false,
              allow_google_signals: false,
              anonymize_ip: true, // ignoré par GA4 mais safe
              debug_mode: ${DEBUG_MODE ? 'true' : 'false'},
              page_path: location.pathname + location.search
            });
          })();
        `}
      </Script>
    </>
  )
}
