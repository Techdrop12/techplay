// src/lib/ga.ts
// Couche GA / dataLayer SSR-safe, tolérante, rétro-compatible (funnel + dashboards)

import { FUNNEL_STEPS, type ListName } from './analytics-events'

export const GA_TRACKING_ID =
  process.env.NEXT_PUBLIC_GA_ID ||
  process.env.NEXT_PUBLIC_GA_TRACKING_ID ||
  ''

export type GAParams = Record<string, unknown>

export type GAItem = {
  item_id: string
  item_name: string
  price?: number
  quantity?: number
  item_category?: string
  item_brand?: string
  item_variant?: string
  coupon?: string
  discount?: number
  index?: number
}

export type GAEventObject = {
  action: string
  category?: string
  label?: string
  value?: number
  nonInteraction?: boolean
  params?: GAParams
}

type DataLayerEntry = NonNullable<Window['dataLayer']>[number]

const isBrowser = () => typeof window !== 'undefined'

function getGtag() {
  if (!isBrowser()) return undefined
  return window.gtag
}

function ensureDataLayer(): NonNullable<Window['dataLayer']> {
  if (!isBrowser()) return []

  if (!Array.isArray(window.dataLayer)) {
    window.dataLayer = []
  }

  return window.dataLayer
}

export function pushDataLayer(obj: Record<string, unknown>): void {
  if (!isBrowser()) return
  ensureDataLayer().push(obj)
}

export function sendGA(event: { name: string; params?: GAParams }): void {
  if (!event?.name) return
  logEvent(event.name, event.params)
}

export function initAnalytics(): void {
  if (!isBrowser() || !GA_TRACKING_ID) return

  ensureDataLayer()

  if (typeof window.gtag !== 'function') {
    window.gtag = (...args: Gtag.Command) => {
      ensureDataLayer().push(args as DataLayerEntry)
    }
  }

  if (!window.__ga_inited) {
    try {
      window.gtag?.('js', new Date())
      window.gtag?.('config', GA_TRACKING_ID, {
        anonymize_ip: true,
        send_page_view: false,
      })
      window.__ga_inited = true
    } catch {}
  }
}

export function pageview(url: string): void {
  if (!url) return

  const params: GAParams = {
    page_path: url,
    page_location: isBrowser() ? window.location.href : url,
    page_title: isBrowser() ? document.title : undefined,
  }

  const gtag = getGtag()
  if (typeof gtag === 'function' && GA_TRACKING_ID) {
    try {
      gtag('config', GA_TRACKING_ID, params)
      return
    } catch {}
  }

  pushDataLayer({ event: 'page_view', ...params })
}

export function logEvent(name: string, params?: GAParams): void {
  if (!name) return

  const gtag = getGtag()
  if (typeof gtag === 'function') {
    try {
      gtag('event', name, params ?? {})
      return
    } catch {}
  }

  pushDataLayer({ event: name, ...(params ?? {}) })
}

export function event(input: string | GAEventObject, params?: GAParams): void {
  if (typeof input === 'string') {
    logEvent(input, params)
    return
  }

  const payload: GAParams = {
    event_category: input.category,
    event_label: input.label,
    value: input.value,
    non_interaction: input.nonInteraction,
    ...(input.params ?? {}),
  }

  logEvent(input.action, payload)
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : v == null ? fallback : String(v)
}

function num(v: unknown): number | undefined {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : undefined
}

export function mapProductToGaItem(product: Record<string, unknown>): GAItem {
  const itemId =
    str(product._id) ||
    str(product.id) ||
    str(product.slug) ||
    str(product.sku) ||
    'unknown-item'

  const price = num(product.price)
  const oldPrice = num(product.oldPrice)
  const quantity = Math.max(1, num(product.quantity) ?? 1)

  return {
    item_id: itemId,
    item_name: str(product.title) || str(product.name) || 'Produit',
    price,
    quantity,
    item_category: str(product.category) || undefined,
    item_brand: str(product.brand) || undefined,
    item_variant: str(product.variant) || undefined,
    discount:
      typeof oldPrice === 'number' && typeof price === 'number' && oldPrice > price
        ? oldPrice - price
        : undefined,
  }
}

export function trackViewItem(params: {
  currency?: string
  value?: number
  items: GAItem[]
}): void {
  const payload = { ...params, funnel_step: FUNNEL_STEPS.VIEW_ITEM }
  logEvent('view_item', payload)
  try {
    ensureDataLayer().push({
      event: 'view_item',
      ecommerce: { currency: params.currency, value: params.value, items: params.items },
      funnel_step: FUNNEL_STEPS.VIEW_ITEM,
    })
  } catch {
    // no-op
  }
}

/** Affichage d’une liste de produits (catalogue, catégorie, recommandations). Pour funnel + dashboards. */
export function trackViewItemList(params: {
  item_list_name?: ListName | string
  currency?: string
  value?: number
  items: GAItem[]
}): void {
  const payload = {
    ...params,
    funnel_step: 'view_list' as const,
  }
  logEvent('view_item_list', payload)
  try {
    ensureDataLayer().push({
      event: 'view_item_list',
      ecommerce: {
        item_list_name: params.item_list_name,
        currency: params.currency,
        value: params.value,
        items: params.items,
      },
      funnel_step: 'view_list',
    })
  } catch {
    // no-op
  }
}

export function trackSelectItem(params: {
  currency?: string
  value?: number
  item_list_name?: string
  items: GAItem[]
}): void {
  logEvent('select_item', params)
}

export function trackAddToCart(params: {
  currency?: string
  value?: number
  items: GAItem[]
  item_list_name?: ListName | string
  ab_experiment?: string
  ab_variant?: string
}): void {
  const payload = { ...params, funnel_step: FUNNEL_STEPS.ADD_TO_CART }
  logEvent('add_to_cart', payload)
  try {
    ensureDataLayer().push({
      event: 'add_to_cart',
      ecommerce: { currency: params.currency, value: params.value, items: params.items },
      funnel_step: FUNNEL_STEPS.ADD_TO_CART,
      ...(params.item_list_name ? { item_list_name: params.item_list_name } : {}),
      ...(params.ab_experiment ? { ab_experiment: params.ab_experiment, ab_variant: params.ab_variant } : {}),
    })
  } catch {
    // no-op
  }
}

export function trackViewCart(params: {
  currency?: string
  value?: number
  items: GAItem[]
}): void {
  const payload = { ...params, funnel_step: FUNNEL_STEPS.VIEW_CART }
  logEvent('view_cart', payload)
  try {
    ensureDataLayer().push({
      event: 'view_cart',
      ecommerce: { currency: params.currency, value: params.value, items: params.items },
      funnel_step: FUNNEL_STEPS.VIEW_CART,
    })
  } catch {
    // no-op
  }
}

export function trackAddToWishlist(params: {
  currency?: string
  value?: number
  items: GAItem[]
}): void {
  logEvent('add_to_wishlist', params)
}

export function trackBeginCheckout(params: {
  currency?: string
  value?: number
  coupon?: string
  items: GAItem[]
}): void {
  const payload = { ...params, funnel_step: FUNNEL_STEPS.BEGIN_CHECKOUT }
  logEvent('begin_checkout', payload)
  try {
    ensureDataLayer().push({
      event: 'begin_checkout',
      ecommerce: { currency: params.currency, value: params.value, coupon: params.coupon, items: params.items },
      funnel_step: FUNNEL_STEPS.BEGIN_CHECKOUT,
    })
  } catch {
    // no-op
  }
}

export function trackAddShippingInfo(params: {
  currency?: string
  value?: number
  shipping_tier?: string
  coupon?: string
  items: GAItem[]
}): void {
  logEvent('add_shipping_info', params)
}

export function trackPurchase(params: {
  transaction_id?: string
  affiliation?: string
  value?: number
  tax?: number
  shipping?: number
  currency?: string
  coupon?: string
  items: GAItem[]
}): void {
  const payload = { ...params, funnel_step: FUNNEL_STEPS.PURCHASE }
  logEvent('purchase', payload)
  try {
    ensureDataLayer().push({
      event: 'purchase',
      ecommerce: {
        transaction_id: params.transaction_id,
        currency: params.currency,
        value: params.value,
        tax: params.tax,
        shipping: params.shipping,
        coupon: params.coupon,
        items: params.items,
      },
      funnel_step: FUNNEL_STEPS.PURCHASE,
    })
  } catch {
    // no-op
  }
}

export default {
  GA_TRACKING_ID,
  initAnalytics,
  pageview,
  logEvent,
  event,
  sendGA,
  pushDataLayer,
  trackViewItemList,
  trackViewCart,
  mapProductToGaItem,
  trackViewItem,
  trackSelectItem,
  trackAddToCart,
  trackAddToWishlist,
  trackBeginCheckout,
  trackAddShippingInfo,
  trackPurchase,
}