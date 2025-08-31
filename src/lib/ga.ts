// src/lib/ga.ts
// 📊 Google Analytics 4 — “god mode” utils (TS)
// SSR-safe, DNT, opt-out, Consent Mode v2, queues (RAM + offline),
// sampling, helpers e-com, bridge gtag->dataLayer optionnel (sGTM ok).

/* ============================= Globals & setup ============================= */

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: any[]) => void
    __consentState?: Record<string, 'granted' | 'denied'>
  }
}

export const GA_TRACKING_ID: string = process.env.NEXT_PUBLIC_GA_ID || ''

const isBrowser = typeof window !== 'undefined'

// Respect DNT
const doNotTrack: boolean =
  isBrowser &&
  (((navigator as any).doNotTrack === '1') ||
    ((window as any).doNotTrack === '1') ||
    ((navigator as any).msDoNotTrack === '1'))

// Opt-out via ENV
const envOptOut: boolean =
  (process.env.NEXT_PUBLIC_ANALYTICS_DISABLED || '').toLowerCase() === 'true'

// Debug (events taggés debug_mode): true si localhost ou ENV
const debugMode: boolean =
  (process.env.NEXT_PUBLIC_GA_DEBUG || '').toLowerCase() === 'true' ||
  (isBrowser && /^localhost|^127\.0\.0\.1/.test(location.hostname))

// Sampling par session (0–100). Par défaut 100 (tout envoyé)
const SAMPLE_PCT = Math.min(
  100,
  Math.max(0, Number(process.env.NEXT_PUBLIC_ANALYTICS_SAMPLE ?? 100))
)

function isSampledIn(): boolean {
  if (!isBrowser) return true
  try {
    const KEY = 'ga:sample-in'
    const had = sessionStorage.getItem(KEY)
    if (had != null) return had === '1'
    const inSample = Math.random() * 100 < SAMPLE_PCT
    sessionStorage.setItem(KEY, inSample ? '1' : '0')
    return inSample
  } catch {
    return true
  }
}

// Opt-out via storage
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

// Désactivation via variable globale officielle `ga-disable-<ID>`
function windowDisableFlag(): boolean {
  if (!isBrowser || !GA_TRACKING_ID) return false
  try {
    const key = `ga-disable-${GA_TRACKING_ID}`
    return (window as any)[key] === true
  } catch {
    return false
  }
}

// GA activé globalement
function isGaEnabled(): boolean {
  return (
    !!GA_TRACKING_ID &&
    !doNotTrack &&
    !envOptOut &&
    !storageOptOut() &&
    !windowDisableFlag()
  )
}

// Bridge gtag -> dataLayer (GTM) — opt-in via ENV
const BRIDGE_TO_DATALAYER =
  (process.env.NEXT_PUBLIC_GTAG_TO_DATALAYER || '').trim() === '1'

function canTrack(): boolean {
  return (
    isBrowser &&
    typeof (window as any).gtag === 'function' &&
    isGaEnabled() &&
    isSampledIn()
  )
}

/* ============================== Queues & flush ============================= */

// Queue avant gtag prêt
const queue: any[][] = []

// OFFLINE queue persistée
type OfflineEvt = { args: any[]; ts: number }
const OFFLINE_KEY = 'ga:offline-queue'

function readOfflineQueue(): OfflineEvt[] {
  if (!isBrowser) return []
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]') || []
  } catch {
    return []
  }
}

function writeOfflineQueue(q: OfflineEvt[]) {
  if (!isBrowser) return
  try {
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(q.slice(-200)))
  } catch {}
}

function pushOffline(args: any[]) {
  const q = readOfflineQueue()
  q.push({ args, ts: Date.now() })
  writeOfflineQueue(q)
}

function flushOffline() {
  if (!canTrack()) return
  const q = readOfflineQueue()
  if (!q.length) return
  for (const it of q) {
    ;(window as any).gtag(...it.args)
  }
  writeOfflineQueue([])
}

let pollerStarted = false
function startFlushPoller() {
  if (pollerStarted || !isBrowser) return
  pollerStarted = true
  const id = window.setInterval(() => {
    if (canTrack()) {
      flushQueue()
      flushOffline()
      window.clearInterval(id)
      pollerStarted = false
    }
  }, 400)
}

function flushQueue() {
  if (!canTrack()) return
  while (queue.length) {
    const args = queue.shift()!
    ;(window as any).gtag(...args)
  }
}

// Bridge helper (objet {event, ...} consommé par GTM)
function pushDataLayerEvent(eventName: string, params?: Record<string, any>) {
  if (!isBrowser) return
  try {
    const dl = ((window as any).dataLayer = (window as any).dataLayer || [])
    dl.push({ event: eventName, ...(params || {}) })
  } catch {}
}

function gtagSafe(...args: any[]) {
  if (!isGaEnabled() || !isBrowser || !isSampledIn()) return

  // Ajoute debug_mode automatiquement
  if (typeof args[0] === 'string' && args[0] === 'event') {
    const params = (args[2] = args[2] || {})
    if (debugMode && typeof params === 'object') {
      if (!('debug_mode' in params)) (params as any).debug_mode = true
    }
  }

  // Miroir facultatif vers dataLayer (GTM)
  if (BRIDGE_TO_DATALAYER && args[0] === 'event' && typeof args[1] === 'string') {
    try {
      pushDataLayerEvent(args[1], args[2] || {})
    } catch {}
  }

  if (navigator.onLine) {
    if (canTrack()) {
      ;(window as any).gtag(...args)
    } else {
      queue.push(args)
      startFlushPoller()
    }
  } else {
    pushOffline(args)
  }
}

// Flush sur “online” / visibilité / idle
if (isBrowser) {
  window.addEventListener('online', () => {
    startFlushPoller()
    flushOffline()
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      startFlushPoller()
      flushOffline()
    }
  })
  const ric =
    (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 300))
  ric(() => {
    startFlushPoller()
    flushOffline()
  })
}

/* =========================== Consent Mode v2 ============================ */

type ConsentValue = 'granted' | 'denied'
type ConsentUpdate = Partial<{
  ad_storage: ConsentValue
  analytics_storage: ConsentValue
  ad_user_data: ConsentValue
  ad_personalization: ConsentValue
  functionality_storage: ConsentValue
  security_storage: ConsentValue
}> & Record<string, ConsentValue>

/** Expose et met à jour un snapshot global (utilisé par Pixel). */
function setGlobalConsentState(update: Record<string, ConsentValue>) {
  try {
    ;(window as any).__consentState = {
      ...(window as any).__consentState,
      ...update,
    }
  } catch {}
}

export function setConsentDefault(update: ConsentUpdate) {
  if (!isBrowser) return
  setGlobalConsentState(update as Record<string, ConsentValue>)
  gtagSafe('consent', 'default', { wait_for_update: 500, ...update })
}

export function grantConsent(update: ConsentUpdate = {}) {
  if (!isBrowser) return
  const payload: ConsentUpdate = {
    ad_storage: 'granted',
    analytics_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    functionality_storage: 'granted',
    security_storage: 'granted',
    ...update,
  }
  setGlobalConsentState(payload as Record<string, ConsentValue>)
  gtagSafe('consent', 'update', payload)
}

export function denyConsent(update: ConsentUpdate = {}) {
  if (!isBrowser) return
  const payload: ConsentUpdate = {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'denied',
    security_storage: 'granted',
    ...update,
  }
  setGlobalConsentState(payload as Record<string, ConsentValue>)
  gtagSafe('consent', 'update', payload)
}

export function consent(modeOrUpdate: 'grant' | 'deny' | ConsentUpdate, update?: ConsentUpdate) {
  if (!isBrowser) return
  if (typeof modeOrUpdate === 'string') {
    return modeOrUpdate === 'grant' ? grantConsent(update) : denyConsent(update)
  }
  setGlobalConsentState(modeOrUpdate as Record<string, ConsentValue>)
  gtagSafe('consent', 'update', modeOrUpdate)
}

/** petit helper => type narrow sur 'granted' | 'denied' */
const cv = (b: boolean): ConsentValue => (b ? 'granted' : 'denied')

export function consentUpdateBooleans(p: {
  analytics?: boolean
  ads?: boolean
  ad_user_data?: boolean
  ad_personalization?: boolean
  functionality?: boolean
}) {
  if (!isBrowser) return
  const analytics = !!p.analytics
  const ads = !!p.ads
  const ad_user_data = p.ad_user_data ?? ads
  const ad_personalization = p.ad_personalization ?? ads
  const functionality = p.functionality ?? true

  const update: Record<string, ConsentValue> = {
    analytics_storage: cv(analytics),
    ad_storage: cv(ads),
    ad_user_data: cv(ad_user_data),
    ad_personalization: cv(ad_personalization),
    functionality_storage: cv(functionality),
    security_storage: 'granted',
  }

  setGlobalConsentState(update)
  gtagSafe('consent', 'update', update)
}

/* ============================== Init & Config ============================= */

type InitOptions = {
  config?: Record<string, any>
  disableSignals?: boolean
  nonPersonalizedAds?: boolean
}

export function initAnalytics(opts: InitOptions = {}) {
  if (!isGaEnabled() || !isBrowser) return
  const base: Record<string, any> = {
    allow_google_signals: !(opts.disableSignals ?? false),
    allow_ad_personalization_signals: !(opts.nonPersonalizedAds ?? false),
    send_page_view: false,
  }
  const merged = { ...base, ...(opts.config || {}) }
  gtagSafe('config', GA_TRACKING_ID, merged)
}

/* ================================ Pageviews =============================== */

export function pageview(url: string, title?: string, opts?: { send_page_view?: boolean }) {
  if (!isGaEnabled() || !isBrowser) return
  gtagSafe('config', GA_TRACKING_ID, {
    page_path: url,
    ...(title ? { page_title: title } : {}),
    ...(opts ?? {}),
  })
}

/* ====================== Événements standardisés (GA4) ===================== */

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

/** Événements libres */
export function logEvent(eventName: string, eventParams?: Record<string, unknown>) {
  if (!isGaEnabled() || !isBrowser) return
  const payload = { ...(eventParams || {}) }
  if (debugMode) (payload as any).debug_mode = true
  gtagSafe('event', eventName, payload)
}

/** Alias attendu ailleurs */
export function trackEvent(eventName: string, eventParams?: Record<string, unknown>) {
  return logEvent(eventName, eventParams)
}

/* ============================ E-commerce helpers ========================== */

export type Ga4Item = {
  item_id?: string
  item_name?: string
  price?: number
  quantity?: number
  item_brand?: string
  item_category?: string
  item_variant?: string
  discount?: number
}

export type Ga4Payload = {
  currency?: string
  value?: number
  items: Ga4Item[]
}

export const mapProductToGaItem = (p: any, overrides: Partial<Ga4Item> = {}): Ga4Item => ({
  item_id: p?.id ?? p?._id ?? p?.sku,
  item_name: p?.title ?? p?.name,
  price: p?.price,
  item_brand: p?.brand,
  item_category: p?.category ?? p?.categorySlug,
  item_variant: p?.variant,
  ...overrides,
})

/* ------------------ Anti-doublon doux pour les events ecom ---------------- */

const SEEN = new Map<string, number>()
const DEDUPE_MS = 1200

function emit(eventName: string, params: Record<string, any>) {
  if (!isGaEnabled() || !isBrowser) return
  const sig = JSON.stringify({
    e: eventName,
    v: params?.value ?? null,
    i: Array.isArray(params?.items)
      ? params.items.map((it: any) => [it.item_id, it.quantity, it.price])
      : null,
    l: params?.item_list_id ?? params?.item_list_name ?? undefined,
  })
  const now = Date.now()
  const last = SEEN.get(sig) ?? 0
  if (now - last < DEDUPE_MS) return
  SEEN.set(sig, now)
  gtagSafe('event', eventName, params)
}

/* ------------------------------ Trackers E-com ---------------------------- */

export function trackViewItem(payload: Ga4Payload) {
  emit('view_item', payload)
}

export function trackViewItemList(payload: Ga4Payload & { item_list_id?: string; item_list_name?: string }) {
  emit('view_item_list', payload)
}

export function trackSelectItem(payload: Ga4Payload & { item_list_id?: string; item_list_name?: string }) {
  emit('select_item', payload)
}

export function trackAddToCart(payload: Ga4Payload) {
  emit('add_to_cart', payload)
}

export function trackRemoveFromCart(payload: Ga4Payload) {
  emit('remove_from_cart', payload)
}

export function trackViewCart(payload: Ga4Payload) {
  emit('view_cart', payload)
}

export function trackAddToWishlist(payload: Ga4Payload) {
  emit('add_to_wishlist', payload)
}

export function trackBeginCheckout(payload: Ga4Payload & { coupon?: string }) {
  emit('begin_checkout', payload)
}

export function trackAddShippingInfo(payload: Ga4Payload & { shipping_tier?: string; coupon?: string }) {
  emit('add_shipping_info', payload)
}

export function trackAddPaymentInfo(payload: Ga4Payload & { payment_type?: string; coupon?: string }) {
  emit('add_payment_info', payload)
}

export function trackPurchase(
  payload: Ga4Payload & {
    transaction_id: string
    tax?: number
    shipping?: number
    coupon?: string
  }
) {
  emit('purchase', payload)
}

export function trackRefund(payload: { transaction_id: string; value?: number; currency?: string; items?: Ga4Item[] }) {
  emit('refund', payload as any)
}

/* ================================ Users =================================== */

export function setUserId(userId: string | null) {
  if (!isGaEnabled() || !isBrowser) return
  if (userId) {
    gtagSafe('config', GA_TRACKING_ID, { user_id: String(userId) })
  } else {
    gtagSafe('config', GA_TRACKING_ID, { user_id: undefined })
  }
}

export function setUserProperties(props: Record<string, unknown>) {
  if (!isGaEnabled() || !isBrowser) return
  gtagSafe('set', 'user_properties', props)
}

export function getClientId(): string | null {
  if (!isBrowser) return null
  try {
    const m = document.cookie.match(/(?:^|;\s*)_ga=GA1\.\d\.(\d+\.\d+)/)
    return m ? m[1] : null
  } catch {
    return null
  }
}

/* =============================== DataLayer ================================ */

export function pushDataLayer(data: Record<string, unknown>) {
  if (!isBrowser) return
  ;(window as any).dataLayer = (window as any).dataLayer || []
  ;(window as any).dataLayer.push(data)
}

/* ============================= Enable / Opt-out =========================== */

export function isAnalyticsEnabled(): boolean {
  return isGaEnabled()
}

export function setLocalAnalyticsEnabled(enabled: boolean) {
  if (!isBrowser) return
  try {
    if (enabled) {
      localStorage.removeItem('ga:disabled')
      localStorage.removeItem('analytics:disabled')
      startFlushPoller()
      flushOffline()
    } else {
      localStorage.setItem('ga:disabled', '1')
    }
  } catch {}
}
