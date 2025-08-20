export type PixelEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | (string & {})

export function trackPixel(event: PixelEvent, params?: Record<string, any>) {
  if (typeof window === 'undefined') return false
  const fbq: any = (window as any).fbq
  if (typeof fbq !== 'function') return false
  try {
    params ? fbq('track', event, params) : fbq('track', event)
    return true
  } catch {
    return false
  }
}
