'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { useEffect, useMemo, useRef, useState } from 'react'

import { log } from '@/lib/logger'
import { isPixelReady, pixelPageView } from '@/lib/meta-pixel'

declare global {
  interface Window {
    _fbq?: unknown
    __pixelInited?: boolean
    __pixelHashedAM?: Record<string, string> | null
  }
}

type PixelUser = Partial<{
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

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ''
const ENABLE_IN_DEV = (process.env.NEXT_PUBLIC_PIXEL_IN_DEV || '').toLowerCase() === 'true'
const DEBUG = (process.env.NEXT_PUBLIC_PIXEL_DEBUG || '').toLowerCase() === 'true'

function getPixelUser(): PixelUser | null {
  if (typeof window === 'undefined' || !window.__pixelUser || typeof window.__pixelUser !== 'object') {
    return null
  }

  const record = window.__pixelUser as Record<string, unknown>

  return {
    email: typeof record.email === 'string' ? record.email : undefined,
    phone: typeof record.phone === 'string' ? record.phone : undefined,
    first_name: typeof record.first_name === 'string' ? record.first_name : undefined,
    last_name: typeof record.last_name === 'string' ? record.last_name : undefined,
    city: typeof record.city === 'string' ? record.city : undefined,
    state: typeof record.state === 'string' ? record.state : undefined,
    zip: typeof record.zip === 'string' ? record.zip : undefined,
    country: typeof record.country === 'string' ? record.country : undefined,
    external_id: typeof record.external_id === 'string' ? record.external_id : undefined,
  }
}

function eligibleNow(): boolean {
  if (!PIXEL_ID) return false
  if (typeof window === 'undefined') return false

  const dnt =
    navigator.doNotTrack === '1' ||
    window.doNotTrack === '1' ||
    navigator.msDoNotTrack === '1'

  let optedOut = false
  try {
    optedOut =
      localStorage.getItem('pixel:disabled') === '1' ||
      localStorage.getItem('analytics:disabled') === '1'
  } catch {}

  if (dnt || optedOut) return false
  if (process.env.NODE_ENV !== 'production' && !ENABLE_IN_DEV) return false

  try {
    const consent = window.__consentState ?? {}
    const adsGranted =
      consent.ad_storage === 'granted' ||
      consent.ad_user_data === 'granted' ||
      consent.ad_personalization === 'granted'
    const localConsent = localStorage.getItem('consent:ads') === '1'
    if (!adsGranted && !localConsent) return false
  } catch {
    return false
  }

  return true
}

const normalizers: Record<string, (value: string) => string> = {
  em: (value) => value.trim().toLowerCase(),
  ph: (value) => value.replace(/[^0-9]/g, ''),
  fn: (value) => value.trim().toLowerCase(),
  ln: (value) => value.trim().toLowerCase(),
  ct: (value) => value.trim().toLowerCase(),
  st: (value) => value.trim().toLowerCase(),
  zp: (value) => value.trim(),
  country: (value) => value.trim().toLowerCase(),
  external_id: (value) => value.trim(),
}

async function sha256Hex(input: string): Promise<string> {
  try {
    const encoded = new TextEncoder().encode(input)
    const buffer = await crypto.subtle.digest('SHA-256', encoded)
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  } catch {
    return ''
  }
}

async function buildAdvancedMatching(): Promise<Record<string, string> | null> {
  if (typeof window !== 'undefined' && window.__pixelHashedAM) return window.__pixelHashedAM

  const user = getPixelUser()
  if (!user) return null

  const raw: Array<[keyof typeof normalizers, string | undefined]> = [
    ['em', user.email],
    ['ph', user.phone],
    ['fn', user.first_name],
    ['ln', user.last_name],
    ['ct', user.city],
    ['st', user.state],
    ['zp', user.zip],
    ['country', user.country],
    ['external_id', user.external_id],
  ]

  const entries: Array<[string, string]> = []

  for (const [key, value] of raw) {
    if (!value || !String(value).trim()) continue
    const normalized = normalizers[key](String(value))
    const hashed = await sha256Hex(normalized)
    if (hashed) entries.push([key, hashed])
  }

  const output = entries.length ? Object.fromEntries(entries) : null
  if (typeof window !== 'undefined') window.__pixelHashedAM = output
  return output
}

export default function MetaPixel() {
  const pathname = usePathname() || '/'
  const [shouldLoad, setShouldLoad] = useState(false)
  const [am, setAM] = useState<Record<string, string> | null>(null)
  const lastPathRef = useRef('')

  const debugLog = useMemo(
    () => (...args: unknown[]) => {
      if (!DEBUG) return
      log('[Pixel]', ...args)
    },
    []
  )

  useEffect(() => {
    setShouldLoad(eligibleNow())
  }, [])

  useEffect(() => {
    const onConsent = () => {
      const eligible = eligibleNow()
      setShouldLoad(eligible)
      if (!eligible) lastPathRef.current = ''
      debugLog('Consent update, eligible =', eligible)
    }

    const onUser = async () => {
      try {
        const advancedMatching = await buildAdvancedMatching()
        setAM(advancedMatching || null)
        if (advancedMatching) debugLog('Advanced Matching updated:', Object.keys(advancedMatching))
      } catch {}
    }

    window.addEventListener('tp:consent', onConsent as EventListener)
    window.addEventListener('tp:pixel-user', onUser as EventListener)

    return () => {
      window.removeEventListener('tp:consent', onConsent as EventListener)
      window.removeEventListener('tp:pixel-user', onUser as EventListener)
    }
  }, [debugLog])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const advancedMatching = await buildAdvancedMatching()
        if (!cancelled) setAM(advancedMatching)
        if (advancedMatching) debugLog('Advanced Matching ready:', Object.keys(advancedMatching))
      } catch {}
    })()

    return () => {
      cancelled = true
    }
  }, [pathname, debugLog])

  useEffect(() => {
    if (!shouldLoad) return
    if (lastPathRef.current === pathname) return

    lastPathRef.current = pathname

    const fire = () => {
      if (isPixelReady()) {
        debugLog('PageView', pathname)
        pixelPageView()
      } else {
        window.setTimeout(() => {
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
      <Script id="meta-pixel" strategy="afterInteractive" onReady={() => debugLog('fbevents.js loaded')}>
        {`
          (function(f,b,e,v,n,t,s){
            if (f.__pixelInited) return;
            if (f.fbq) { f.__pixelInited = true; return; }
            n=f.fbq=function(){n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)};
            if (!f._fbq) f._fbq=n; n.push=n; n.loaded=!0; n.version='2.0';
            n.queue=[]; t=b.createElement(e); t.async=!0;
            t.src=v; s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);
            f.__pixelInited = true;
          })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
          try { fbq('init', '${PIXEL_ID}'); } catch(e) {}
        `}
      </Script>

      {am && (
        <Script id="meta-pixel-advanced-matching" strategy="afterInteractive" onReady={() => debugLog('Advanced Matching applied')}>
          {`try{ fbq('init', '${PIXEL_ID}', ${JSON.stringify(am)}); }catch(e){}`}
        </Script>
      )}

      <noscript
        dangerouslySetInnerHTML={{
          __html: `
            <img height="1" width="1" style="display:none" alt=""
                 src="https://www.facebook.com/tr?id=${encodeURIComponent(PIXEL_ID)}&ev=PageView&noscript=1"/>
          `,
        }}
      />
    </>
  )
}

