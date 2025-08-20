// src/lib/ga.ts
// 📊 Google Analytics 4 — utilitaires robustes (TS), SSR-safe, DNT, opt-out, Consent Mode v2, file d’attente.

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: any[]) => void
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || ''

/** Détermine si on peut toucher au window */
const isBrowser = typeof window !== 'undefined'

/** Respecte "Do Not Track" de l’OS/navigateur */
const doNotTrack =
  isBrowser &&
  (((navigator as any).doNotTrack === '1') ||
    ((window as any).doNotTrack === '1') ||
    ((navigator as any).msDoNotTrack === '1'))

/** Opt-out manuel: via env ou storage */
const envOptOut =
  (process.env.NEXT_PUBLIC_ANALYTICS_DISABLED || '').toLowerCase() === 'true'

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

/** GA activé si ID présent, pas DNT, pas opt-out */
function isGaEnabled(): boolean {
  return !!GA_TRACKING_ID && !doNotTrack && !envOptOut && !storageOptOut()
}

/** Petite file d’attente pour les appels avant que gtag soit prêt */
const queue: any[][] = []

function canTrack(): boolean {
  return isBrowser && typeof window.gtag === 'function' && isGaEnabled()
}

function gtagSafe(...args: any[]) {
  if (!isGaEnabled() || !isBrowser) return
  if (canTrack()) {
    window.gtag!(...args)
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
  while (queue.length && canTrack()) {
    const args = queue.shift()!
    window.gtag!(...args)
  }
}

/* ======================== Consent Mode v2 ======================== */

type ConsentValue = 'granted' | 'denied'
type ConsentUpdate = Partial<{
  ad_storage: ConsentValue
  analytics_storage: ConsentValue
  ad_user_data: ConsentValue
  ad_personalization: ConsentValue
}> & Record<string, ConsentValue>

/** Définis un état par défaut (ex: tout "denied" au chargement) */
export function setConsentDefault(update: ConsentUpdate) {
  if (!isBrowser) return
  gtagSafe('consent', 'default', update)
}

/** Accorde le consentement (ex: après accept) */
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

/** Refuse le consentement (ex: "Tout refuser") */
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

/* ======================== Pageviews ======================== */

export function pageview(url: string, title?: string, opts?: { send_page_view?: boolean }) {
  if (!isGaEnabled() || !isBrowser) return
  gtagSafe('config', GA_TRACKING_ID, {
    page_path: url,
    ...(title ? { page_title: title } : {}),
    ...(opts ?? {}),
  })
}

/* ======================== Événements standardisés ======================== */

export type GAEventParams = {
  action: string
  category?: string
  label?: string
  value?: number // optionnel
  nonInteraction?: boolean
  params?: Record<string, unknown>
}

export function event({
  action,
  category,
  label,
  value,
  nonInteraction,
  params,
}: GAEventParams) {
  if (!isGaEnabled() || !isBrowser) return
  const payload: Record<string, any> = { ...(params || {}) }
  if (category) payload.event_category = category
  if (label) payload.event_label = label
  if (typeof value === 'number') payload.value = Math.round(value)
  if (nonInteraction) payload.non_interaction = true
  gtagSafe('event', action, payload)
}

/** Événements libres (nom + params arbitraires) */
export function logEvent(eventName: string, eventParams?: Record<string, unknown>) {
  if (!isGaEnabled() || !isBrowser) return
  gtagSafe('event', eventName, eventParams || {})
}

/* ======================== E-commerce helpers (GA4) ======================== */

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
  payload: Ga4Payload & {
    transaction_id: string
    tax?: number
    shipping?: number
    coupon?: string
  }
) {
  if (!isGaEnabled() || !isBrowser) return
  gtagSafe('event', 'purchase', payload)
}

/* ======================== User helpers ======================== */

export function setUserId(userId: string | null) {
  if (!isGaEnabled() || !isBrowser) return
  if (userId) gtagSafe('set', { user_id: String(userId) })
}

export function setUserProperties(props: Record<string, unknown>) {
  if (!isGaEnabled() || !isBrowser) return
  gtagSafe('set', 'user_properties', props)
}

/* ======================== DataLayer (GTM) ======================== */

export function pushDataLayer(data: Record<string, unknown>) {
  if (!isBrowser) return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(data)
}

/* ======================== Exposed helpers ======================== */

export function isAnalyticsEnabled(): boolean {
  return isGaEnabled()
}

/** Active/désactive localement (ex: préférences utilisateur) */
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
