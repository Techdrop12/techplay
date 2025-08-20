// src/lib/ga.ts
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: any[]) => void
  }
}

export const GA_TRACKING_ID: string = process.env.NEXT_PUBLIC_GA_ID || ''

const isBrowser = typeof window !== 'undefined'

const doNotTrack =
  isBrowser &&
  (((navigator as any).doNotTrack === '1') ||
    ((window as any).doNotTrack === '1') ||
    ((navigator as any).msDoNotTrack === '1'))

const envOptOut = (process.env.NEXT_PUBLIC_ANALYTICS_DISABLED || '').toLowerCase() === 'true'

function storageOptOut(): boolean {
  if (!isBrowser) return false
  try {
    return (
      localStorage.getItem('ga:disabled') === '1' ||
      localStorage.getItem('analytics:disabled') === '1'
    )
  } catch {
    return false
  }
}

function isGaEnabled(): boolean {
  return !!GA_TRACKING_ID && !doNotTrack && !envOptOut && !storageOptOut()
}

const queue: any[][] = []

function canTrack(): boolean {
  return isBrowser && typeof (window as any).gtag === 'function' && isGaEnabled()
}

function gtagSafe(...args: any[]) {
  if (!isGaEnabled() || !isBrowser) return
  if (canTrack()) {
    ;(window as any).gtag(...args)
  } else {
    queue.push(args)
    startFlushPoller()
  }
}

let pollerStarted = false
function startFlushPoller() {
  if (pollerStarted || !isBrowser) return
  pollerStarted = true
  const id = window.setInterval(() => {
    if (canTrack()) {
      flushQueue()
      window.clearInterval(id)
      pollerStarted = false
    }
  }, 400)
}

function flushQueue() {
  if (!canTrack()) return
  while (queue.length && canTrack()) {
    const args = queue.shift()!
    ;(window as any).gtag(...args)
  }
}

/* ===== Consent Mode v2 ===== */
type ConsentValue = 'granted' | 'denied'
type ConsentUpdate = Partial<{
  ad_storage: ConsentValue
  analytics_storage: ConsentValue
  ad_user_data: ConsentValue
  ad_personalization: ConsentValue
}> & Record<string, ConsentValue>

export function setConsentDefault(update: ConsentUpdate) {
  if (!isBrowser) return
  gtagSafe('consent', 'default', update)
}

export function grantConsent(update: ConsentUpdate = {}) {
  if (!isBrowser) return
  gtagSafe('consent', 'update', {
    ad_storage: 'granted',
    analytics_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    ...update,
  })
}

export function denyConsent(update: ConsentUpdate = {}) {
  if (!isBrowser) return
  gtagSafe('consent', 'update', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    ...update,
  })
}

export function consent(modeOrUpdate: 'grant' | 'deny' | ConsentUpdate, update?: ConsentUpdate) {
  if (!isBrowser) return
  if (typeof modeOrUpdate === 'string') {
    return modeOrUpdate === 'grant' ? grantConsent(update) : denyConsent(update)
  }
  gtagSafe('consent', 'update', modeOrUpdate)
}

/* ===== Pageviews ===== */
export function pageview(url: string, title?: string, opts?: { send_page_view?: boolean }) {
  if (!isGaEnabled() || !isBrowser) return
  gtagSafe('config', GA_TRACKING_ID, {
    page_path: url,
    ...(title ? { page_title: title } : {}),
    ...(opts ?? {}),
  })
}

/* ===== Events ===== */
export type GAEventParams = {
  action: string
  category?: string
  label?: string
  value?: number
  nonInteraction?: boolean
  params?: Record<string, unknown>
}

export function event({ action, category, label, value, nonInteraction, params }: GAEventParams) {
  if (!isGaEnabled() || !isBrowser) return
  const payload: Record<string, any> = { ...(params || {}) }
  if (category) payload.event_category = category
  if (label) payload.event_label = label
  if (typeof value === 'number') payload.value = Math.round(value)
  if (nonInteraction) payload.non_interaction = true
  gtagSafe('event', action, payload)
}

export function logEvent(eventName: string, eventParams?: Record<string, unknown>) {
  if (!isGaEnabled() || !isBrowser) return
  gtagSafe('event', eventName, eventParams || {})
}

export function trackEvent(eventName: string, eventParams?: Record<string, unknown>) {
  return logEvent(eventName, eventParams)
}

/* ===== GA4 E-commerce ===== */
type Ga4Item = {
  item_id?: string
  item_name?: string
  price?: number
  quantity?: number
  item_brand?: string
  item_category?: string
  item_variant?: string
  discount?: number
}

type Ga4Payload = {
  currency?: string
  value?: number
  items: Ga4Item[]
}

export function trackViewItem(payload: Ga4Payload) {
  if (!isGaEnabled() || !isBrowser) return
  gtagSafe('event', 'view_item', payload)
}

export function trackAddToCart(payload: Ga4Payload) {
  if (!isGaEnabled() || !isBrowser) return
  gtagSafe('event', 'add_to_cart', payload)
}

export function trackAddToWishlist(payload: Ga4Payload) {
  if (!isGaEnabled() || !isBrowser) return
  gtagSafe('event', 'add_to_wishlist', payload)
}

export function trackBeginCheckout(payload: Ga4Payload & { coupon?: string }) {
  if (!isGaEnabled() || !isBrowser) return
  gtagSafe('event', 'begin_checkout', payload)
}

export function trackPurchase(
  payload: Ga4Payload & { transaction_id: string; tax?: number; shipping?: number; coupon?: string }
) {
  if (!isGaEnabled() || !isBrowser) return
  gtagSafe('event', 'purchase', payload)
}

/* ===== User ===== */
export function setUserId(userId: string | null) {
  if (!isGaEnabled() || !isBrowser) return
  if (userId) gtagSafe('set', { user_id: String(userId) })
}

export function setUserProperties(props: Record<string, unknown>) {
  if (!isGaEnabled() || !isBrowser) return
  gtagSafe('set', 'user_properties', props)
}

/* ===== DataLayer (GTM) ===== */
export function pushDataLayer(data: Record<string, unknown>) {
  if (!isBrowser) return
  ;(window as any).dataLayer = (window as any).dataLayer || []
  ;(window as any).dataLayer.push(data)
}

/* ===== Public helpers ===== */
export function isAnalyticsEnabled(): boolean {
  return isGaEnabled()
}

export function setLocalAnalyticsEnabled(enabled: boolean) {
  if (!isBrowser) return
  try {
    if (enabled) {
      localStorage.removeItem('ga:disabled')
      localStorage.removeItem('analytics:disabled')
    } else {
      localStorage.setItem('ga:disabled', '1')
    }
  } catch {}
}
