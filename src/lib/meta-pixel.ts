// src/lib/meta-pixel.ts
// 🟦 Meta Pixel helpers (TS) — consent-aware côté chargeur, API sûre côté app

export type PixelEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | (string & {})

const isBrowser = typeof window !== 'undefined'

/** Vérifie que fbq est prêt (ou au moins stub initialisé par le snippet). */
export function isPixelReady(): boolean {
  if (!isBrowser) return false
  const fbq = (window as any).fbq
  return typeof fbq === 'function'
}

/** Envoie un event standard ou custom. Retourne true si dispatché. */
export function trackPixel(event: PixelEvent, params?: Record<string, any>): boolean {
  if (!isBrowser) return false
  const fbq: any = (window as any).fbq
  if (typeof fbq !== 'function') return false
  try {
    params ? fbq('track', event, params) : fbq('track', event)
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
    if (enabled) {
      localStorage.removeItem('pixel:disabled')
    } else {
      localStorage.setItem('pixel:disabled', '1')
    }
  } catch {}
}
