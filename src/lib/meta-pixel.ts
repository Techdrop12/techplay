// src/lib/meta-pixel.ts
// Meta Pixel SSR-safe + rétro-compatible

export type PixelParams = Record<string, unknown>

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    __consentState?: Record<string, unknown>
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''

function isBrowser() {
  return typeof window !== 'undefined'
}

export function isPixelReady(): boolean {
  return isBrowser() && typeof window.fbq === 'function' && !!PIXEL_ID
}

export function pixelReadyAndConsented(): boolean {
  if (!isPixelReady()) return false

  try {
    const consent = window.__consentState ?? {}
    const adStorage = consent.ad_storage
    const adUserData = consent.ad_user_data
    const adPersonalization = consent.ad_personalization

    return (
      adStorage === 'granted' ||
      adUserData === 'granted' ||
      adPersonalization === 'granted'
    )
  } catch {
    return true
  }
}

export function trackPixel(eventName: string, params?: PixelParams): void {
  if (!isPixelReady()) return

  try {
    window.fbq?.('track', eventName, params ?? {})
  } catch {}
}

export function pixelPageView(): void {
  if (!isPixelReady()) return
  try {
    window.fbq?.('track', 'PageView')
  } catch {}
}

export function pixelViewContent(params?: PixelParams): void {
  trackPixel('ViewContent', params)
}

export function pixelAddToCart(params?: PixelParams): void {
  trackPixel('AddToCart', params)
}

export function pixelInitiateCheckout(params?: PixelParams): void {
  trackPixel('InitiateCheckout', params)
}

export function pixelPurchase(params?: PixelParams): void {
  trackPixel('Purchase', params)
}

export default {
  isPixelReady,
  pixelReadyAndConsented,
  trackPixel,
  pixelPageView,
  pixelViewContent,
  pixelAddToCart,
  pixelInitiateCheckout,
  pixelPurchase,
}