// src/lib/meta-pixel.ts
// 🟦 Meta Pixel helpers (TS) — consent-aware + eventID (dedupe) + CAPI mirror optionnel (fiabilisé)

import { getClientId } from '@/lib/ga'

export type PixelEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | (string & {})

const isBrowser = typeof window !== 'undefined'

// ===== ENV (tous optionnels) ===============================================
const META_CAPI_URL =
  (process.env.NEXT_PUBLIC_META_CAPI_URL || '').trim() // ex: "/api/meta-capi" (à implémenter côté serveur)
const META_TEST_EVENT_CODE =
  (process.env.NEXT_PUBLIC_META_TEST_CODE || '').trim() // ex: "TEST123" (sandbox)
const ENABLE_IN_DEV =
  (process.env.NEXT_PUBLIC_PIXEL_IN_DEV || '').toLowerCase() === 'true'

// ===== Consent ==============================================================

function hasAdsConsent(): boolean {
  if (!isBrowser) return false
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

function pixelLocallyDisabled(): boolean {
  try {
    return (
      localStorage.getItem('pixel:disabled') === '1' ||
      localStorage.getItem('analytics:disabled') === '1'
    )
  } catch {
    return false
  }
}

/** Utile côté UI : savoir si le pixel tirera effectivement */
export function pixelReadyAndConsented(): boolean {
  return isBrowser && isPixelReady() && hasAdsConsent() && !pixelLocallyDisabled()
}

// ===== Cookies / context ====================================================

function readCookie(name: string): string | null {
  if (!isBrowser) return null
  try {
    const safe = name.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
    const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${safe}=([^;]*)`))
    return m ? decodeURIComponent(m[1]) : null
  } catch {
    return null
  }
}

/** _fbp & _fbc utiles côté CAPI (dédup) */
function getFbpFbc() {
  const fbp = readCookie('_fbp')
  // _fbc uniquement si redirection ads → contient le fbclid
  const fbc = (() => {
    const fromCookie = readCookie('_fbc')
    if (fromCookie) return fromCookie
    try {
      const url = new URL(location.href)
      const fbclid = url.searchParams.get('fbclid')
      if (!fbclid) return null
      // format recommandé: fb.1.<timestamp>.<fbclid>
      return `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid}`
    } catch {
      return null
    }
  })()
  return { fbp, fbc }
}

// ===== EventID (dédup Pixel/CAPI) ==========================================

function uuid(): string {
  if (!isBrowser) return Math.random().toString(36).slice(2)
  try {
    const g = (window as any).crypto?.getRandomValues?.bind((window as any).crypto)
    if (g) {
      const buf = new Uint8Array(16)
      g(buf)
      // RFC4122 v4
      buf[6] = (buf[6] & 0x0f) | 0x40
      buf[8] = (buf[8] & 0x3f) | 0x80
      const b2hex = (n: number) => n.toString(16).padStart(2, '0')
      const hex = Array.from(buf, b2hex).join('')
      return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20)}`
    }
  } catch {}
  return (
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 10) +
    '-' +
    Math.random().toString(36).slice(2, 10)
  )
}

// Dédoublonnage léger sur 1.2 s (signature payload)
const SEEN = new Map<string, number>()
const DEDUPE_MS = 1200
function shouldEmit(sig: string): boolean {
  const now = Date.now()
  const last = SEEN.get(sig) ?? 0
  if (now - last < DEDUPE_MS) return false
  SEEN.set(sig, now)
  return true
}

// Normalisation + compactage (value/currency, pas de undefined/vides)
function normalizeParams(p: Record<string, any> | undefined) {
  if (!p) return p
  const out: Record<string, any> = {}
  for (const k in p) {
    const v = (p as any)[k]
    if (v === undefined || v === null || v === '') continue
    if (k === 'currency' && typeof v === 'string') {
      out[k] = v.toUpperCase()
    } else if (k === 'value' && typeof v === 'string') {
      const n = Number(v.replace(',', '.'))
      out[k] = Number.isNaN(n) ? v : n
    } else {
      out[k] = v
    }
  }
  return out
}

/** Vérifie que fbq est prêt (ou au moins stub initialisé par le snippet). */
export function isPixelReady(): boolean {
  if (!isBrowser) return false
  const fbq = (window as any).fbq
  return typeof fbq === 'function'
}

/** Envoie un event standard ou custom côté Pixel. Retourne true si dispatché. */
export function trackPixel(event: PixelEvent, params?: Record<string, any>): boolean {
  if (!isBrowser) return false
  if (process.env.NODE_ENV !== 'production' && !ENABLE_IN_DEV) return false
  if (!hasAdsConsent() || pixelLocallyDisabled()) return false

  const fbq: any = (window as any).fbq
  if (typeof fbq !== 'function') return false

  try {
    const eventID = uuid()
    const payload = { ...(normalizeParams(params) || {}), eventID }
    const sig = JSON.stringify({ e: event, p: payload })
    if (!shouldEmit(sig)) return false

    fbq('track', event, payload)

    // Miroir CAPI optionnel (dédup via eventID)
    if (META_CAPI_URL) sendCapi(event, payload)

    return true
  } catch {
    return false
  }
}

/** Helpers courants (optionnels) */
export function pixelPageView(): boolean {
  return trackPixel('PageView')
}

export function pixelViewContent(params: {
  content_ids?: (string | number)[]
  content_type?: string
  value?: number
  currency?: string
  content_name?: string
  contents?: Array<{ id: string | number; quantity?: number; item_price?: number }>
}) {
  return trackPixel('ViewContent', params as any)
}

export function pixelAddToCart(params: {
  content_ids?: (string | number)[]
  value?: number
  currency?: string
  contents?: Array<{ id: string | number; quantity?: number; item_price?: number }>
}) {
  return trackPixel('AddToCart', params as any)
}

export function pixelInitiateCheckout(params: {
  value?: number
  currency?: string
  num_items?: number
  contents?: Array<{ id: string | number; quantity?: number; item_price?: number }>
}) {
  return trackPixel('InitiateCheckout', params as any)
}

export function pixelPurchase(params: {
  value: number
  currency: string
  contents?: Array<{ id: string | number; quantity?: number; item_price?: number }>
}) {
  return trackPixel('Purchase', params as any)
}

/** Opt-out local pratique (aligne avec ta logique Analytics). */
export function setLocalPixelEnabled(enabled: boolean) {
  if (!isBrowser) return
  try {
    if (enabled) localStorage.removeItem('pixel:disabled')
    else localStorage.setItem('pixel:disabled', '1')
  } catch {}
}

// ===== CAPI mirror (optionnel via NEXT_PUBLIC_META_CAPI_URL) ===============

function sendBeaconJson(url: string, body: unknown): boolean {
  try {
    const blob = new Blob([JSON.stringify(body)], { type: 'application/json' })
    if ('sendBeacon' in navigator) {
      return navigator.sendBeacon(url, blob)
    }
  } catch {}
  return false
}

function sendCapi(eventName: string, payload: Record<string, any>) {
  if (!isBrowser || !META_CAPI_URL) return

  const { fbp, fbc } = getFbpFbc()
  const client_id = getClientId() || undefined

  const body = {
    action_source: 'website',
    event_name: eventName,
    event_id: payload.eventID, // crucial pour la dédup Pixel/CAPI
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: (() => {
      try {
        return location.href
      } catch {
        return undefined
      }
    })(),
    fbp,
    fbc,
    client_id,
    params: normalizeParams(payload),
    test_event_code: META_TEST_EVENT_CODE || undefined,
  }

  // Préfère sendBeacon pour la fiabilité (navigation départ)
  if (sendBeaconJson(META_CAPI_URL, body)) return

  // Fallback fetch keepalive
  try {
    fetch(META_CAPI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: 'omit',
      cache: 'no-store',
    }).catch(() => {})
  } catch {}
}
