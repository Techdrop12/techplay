// src/components/Analytics.tsx
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { pageview } from '@/lib/ga'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ''
const ENABLE_IN_DEV = process.env.NEXT_PUBLIC_ANALYTICS_IN_DEV === 'true'
const DEBUG_MODE = process.env.NEXT_PUBLIC_GA_DEBUG === 'true'

export default function Analytics() {
  const pathname = usePathname() || '/'

  // Pageview à chaque navigation (pas de double comptage)
  useEffect(() => {
    if (!GA_ID) return
    if (process.env.NODE_ENV !== 'production' && !ENABLE_IN_DEV) return
    const qs = typeof window !== 'undefined' ? window.location.search : ''
    const title = typeof document !== 'undefined' ? document.title : undefined
    pageview(`${pathname}${qs}`, title, { send_page_view: false })
  }, [pathname])

  if (!GA_ID) return null

  return (
    <>
      {/* Charge gtag.js */}
      <Script
        id="ga4-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`}
        strategy="afterInteractive"
      />

      {/* Init gtag + Consent par défaut (denied) + respect DNT/opt-out + no double page_view */}
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          (function() {
            // Respect DNT + opt-out local
            var dnt = (navigator.doNotTrack === '1') || (window.doNotTrack === '1') || (navigator.msDoNotTrack === '1');
            var optedOut = false;
            try {
              optedOut = localStorage.getItem('ga:disabled') === '1' || localStorage.getItem('analytics:disabled') === '1';
            } catch (e) {}
            var DISABLE_KEY = 'ga-disable-${GA_ID}';
            if (dnt || optedOut) { window[DISABLE_KEY] = true; }

            // dataLayer + gtag
            window.dataLayer = window.dataLayer || [];
            function gtag(){ window.dataLayer.push(arguments); }
            window.gtag = window.gtag || gtag;

            // Consent Mode v2: défaut = denied (à ouvrir après consentement utilisateur)
            gtag('consent', 'default', {
              ad_storage: 'denied',
              analytics_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied'
            });

            // Bootstrap GA
            gtag('js', new Date());

            // Config sans page_view automatique (on le fait manuellement via pageview())
            gtag('config', '${GA_ID}', {
              send_page_view: false,
              allow_google_signals: false,
              anonymize_ip: true,
              debug_mode: ${DEBUG_MODE ? 'true' : 'false'},
              page_path: window.location.pathname + window.location.search
            });
          })();
        `}
      </Script>
    </>
  )
}
