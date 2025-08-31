// src/components/MetaPixel.tsx — Ultra+ : consent-aware, SPA PV, advanced matching, anti double-init, debug
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { pixelPageView, isPixelReady } from '@/lib/meta-pixel'

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
    _fbq?: any
    __pixelInited?: boolean
    __pixelHashedAM?: Record<string, string> | null
    __pixelUser?: Partial<{
      email: string
      phone: string
      first_name: string
      last_name: string
      city: string
      state: string
      zip: string
      country: string
      external_id: string
    }>
    __consentState?: Record<string, 'granted' | 'denied'>
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ''
const ENABLE_IN_DEV = (process.env.NEXT_PUBLIC_PIXEL_IN_DEV || '').toLowerCase() === 'true'
const DEBUG = (process.env.NEXT_PUBLIC_PIXEL_DEBUG || '').toLowerCase() === 'true'

/* ----------------------------- Consent helpers ---------------------------- */

function hasAdsConsent(): boolean {
  try {
    const s: any = (window as any).__consentState || {}
    const adsGranted =
      s.ad_storage !== 'denied' ||
      s.ad_user_data !== 'denied' ||
      s.ad_personalization !== 'denied'
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

  // Consent pubs requis
  if (!hasAdsConsent()) return false

  return true
}

/* ------------------------- Advanced Matching (AM) -------------------------- */
/** FB attend des SHA-256 lowercased trim pour: em, ph, fn, ln, ct, st, zp, country, external_id */
const normalizers: Record<string, (v: string) => string> = {
  em: (v) => v.trim().toLowerCase(),
  ph: (v) => v.replace(/[^0-9]/g, ''),
  fn: (v) => v.trim().toLowerCase(),
  ln: (v) => v.trim().toLowerCase(),
  ct: (v) => v.trim().toLowerCase(),
  st: (v) => v.trim().toLowerCase(),
  zp: (v) => v.trim(),
  country: (v) => v.trim().toLowerCase(),
  external_id: (v) => v.trim(),
}

async function sha256Hex(input: string): Promise<string> {
  try {
    const enc = new TextEncoder().encode(input)
    const buf = await crypto.subtle.digest('SHA-256', enc)
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  } catch {
    return ''
  }
}

async function buildAdvancedMatching(): Promise<Record<string, string> | null> {
  if (typeof window !== 'undefined' && window.__pixelHashedAM) return window.__pixelHashedAM
  const u = (typeof window !== 'undefined' && window.__pixelUser) || null
  if (!u) return null
  const raw: Array<[keyof typeof normalizers, string | undefined]> = [
    ['em', u.email],
    ['ph', u.phone],
    ['fn', u.first_name],
    ['ln', u.last_name],
    ['ct', u.city],
    ['st', u.state],
    ['zp', u.zip],
    ['country', u.country],
    ['external_id', u.external_id],
  ]
  const entries: Array<[string, string]> = []
  for (const [k, v] of raw) {
    if (!v || !String(v).trim()) continue
    const norm = normalizers[k](String(v))
    const hashed = await sha256Hex(norm)
    if (hashed) entries.push([k, hashed])
  }
  const out = entries.length ? Object.fromEntries(entries) : null
  if (typeof window !== 'undefined') window.__pixelHashedAM = out
  return out
}

/* --------------------------------- Component ------------------------------- */

export default function MetaPixel() {
  const pathname = usePathname() || '/'
  const [shouldLoad, setShouldLoad] = useState(false)
  const [am, setAM] = useState<Record<string, string> | null>(null)
  const lastPathRef = useRef<string>('')

  const debugLog = useMemo(
    () => (...args: any[]) => {
      if (!DEBUG) return
      // eslint-disable-next-line no-console
      console.log('[Pixel]', ...args)
    },
    []
  )

  // 1) Éligibilité à l'arrivée
  useEffect(() => {
    setShouldLoad(eligibleNow())
  }, [])

  // 2) Recalcule à chaque MAJ consent
  useEffect(() => {
    const onConsent = () => {
      const ok = eligibleNow()
      setShouldLoad(ok)
      if (!ok) lastPathRef.current = ''
      debugLog('Consent update, eligible =', ok)
    }
    window.addEventListener('tp:consent', onConsent as EventListener)
    return () => window.removeEventListener('tp:consent', onConsent as EventListener)
  }, [debugLog])

  // 3) Prépare l’Advanced Matching (si dispo) — asynchrone et idempotent
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const adv = await buildAdvancedMatching()
        if (!cancelled) setAM(adv)
        if (adv) debugLog('Advanced Matching ready:', Object.keys(adv))
      } catch {}
    })()
    return () => {
      cancelled = true
    }
  }, [pathname, debugLog])

  // 4) Fire PageView sur chaque navigation (dédup)
  useEffect(() => {
    if (!shouldLoad) return
    if (lastPathRef.current === pathname) return
    lastPathRef.current = pathname

    const fire = () => {
      if (isPixelReady()) {
        debugLog('PageView', pathname)
        pixelPageView()
      } else {
        setTimeout(() => {
          if (isPixelReady()) {
            debugLog('PageView (late)', pathname)
            pixelPageView()
          }
        }, 0)
      }
    }
    fire()
  }, [pathname, shouldLoad, debugLog])

  if (!shouldLoad) return null

  return (
    <>
      {/* Snippet officiel Meta Pixel — init sans PageView auto */}
      <Script id="meta-pixel" strategy="afterInteractive" onReady={() => debugLog('fbevents.js loaded')}>
        {`
          (function(f,b,e,v,n,t,s){
            if (f.__pixelInited) return; // anti-double init
            if (f.fbq) { f.__pixelInited = true; return; }
            n=f.fbq=function(){n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)};
            if (!f._fbq) f._fbq=n; n.push=n; n.loaded=!0; n.version='2.0';
            n.queue=[]; t=b.createElement(e); t.async=!0;
            t.src=v; s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);
            f.__pixelInited = true;
          })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
          try { fbq('init', '${PIXEL_ID}'); } catch(e) {}
          // Pas de 'PageView' auto ici — SPA gérée via pixelPageView()
        `}
      </Script>

      {/* Si l’Advanced Matching arrive après l’init, on “complète” l’init */}
      {am && (
        <Script
          id="meta-pixel-advanced-matching"
          strategy="afterInteractive"
          onReady={() => debugLog('Advanced Matching applied')}
        >
          {`try{ fbq('init', '${PIXEL_ID}', ${JSON.stringify(am)}); }catch(e){}`}
        </Script>
      )}

      {/* Noscript de courtoisie (ne respecte pas le consent runtime) */}
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
