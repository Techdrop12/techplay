// src/lib/checkout.ts — FINAL+++ (Stripe Checkout client helper)

export type IsoCurrency =
  | 'EUR'
  | 'USD'
  | 'GBP'
  | 'CHF'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'BRL'
  | 'MXN'
  | 'SEK'
  | 'NOK'
  | 'DKK'
  | string

type SupportedCurrency = 'EUR' | 'GBP' | 'USD'

export type CheckoutItem = {
  name: string
  price: number
  quantity: number
  image?: string
  currency?: IsoCurrency
}

export type CreateCheckoutInput = {
  email: string
  address: string
  items?: CheckoutItem[]
  currency?: IsoCurrency
  locale?: string
  idempotencyKey?: string
  metadata?: Record<string, string>
}

export type CheckoutResponse = {
  id?: string
  url?: string
  [k: string]: unknown
}

const TIMEOUT_MS = 15_000
const MAX_ITEMS = 100
const MAX_NAME = 180
const MAX_IMAGE = 512

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function hashFnv1a(str: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return (h >>> 0).toString(16)
}

function clampInt(n: unknown, min: number, def = min): number {
  const v = Math.floor(Number(n))
  if (!Number.isFinite(v)) return def
  return Math.max(min, v)
}

function toNumber(n: unknown, def = 0): number {
  const v = Number(n)
  return Number.isFinite(v) ? v : def
}

function clampLen(s: unknown, max: number): string {
  const v = String(s ?? '')
  return v.length > max ? v.slice(0, max) : v
}

function stableStringify(x: unknown): string {
  if (x === null || typeof x !== 'object') return JSON.stringify(x)

  if (Array.isArray(x)) {
    return `[${x.map(stableStringify).join(',')}]`
  }

  if (!isRecord(x)) {
    return JSON.stringify(x)
  }

  const keys = Object.keys(x).sort()
  const entries = keys.map((k) => `${JSON.stringify(k)}:${stableStringify(x[k])}`)
  return `{${entries.join(',')}}`
}

function safeLocale(l?: string): string {
  if (l && typeof l === 'string' && l.length <= 10) return l

  if (typeof navigator !== 'undefined') {
    const cand = navigator.language || navigator.userLanguage
    if (cand) return String(cand).slice(0, 10)
  }

  return 'fr'
}

function normalizeSupportedCurrency(c?: string): SupportedCurrency {
  const v = String(c || '').trim().toUpperCase()
  if (v === 'GBP') return 'GBP'
  if (v === 'USD') return 'USD'
  return 'EUR'
}

function getCryptoSalt(): string {
  try {
    const cryptoObj = globalThis.crypto

    if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
      return cryptoObj.randomUUID()
    }

    if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
      const arr = new Uint32Array(2)
      cryptoObj.getRandomValues(arr)
      return `${arr[0].toString(16)}${arr[1].toString(16)}`
    }
  } catch {
    // ignore
  }

  return Math.random().toString(16).slice(2)
}

function buildIdempotencyKey(
  payload: Omit<CreateCheckoutInput, 'idempotencyKey'>
): string {
  const base = stableStringify({
    email: payload.email,
    address: payload.address,
    items: (payload.items || []).map((i) => ({
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
      currency: i.currency,
    })),
    currency: normalizeSupportedCurrency(payload.currency),
    locale: safeLocale(payload.locale),
    metadata: payload.metadata || {},
  })

  const salt = getCryptoSalt()
  return `${hashFnv1a(base)}_${hashFnv1a(salt)}`
}

export function buildCheckoutItemsFromCart(
  cart: Array<{
    title?: string
    name?: string
    price?: number
    quantity?: number
    qty?: number
    image?: string
    currency?: string
  }>
): CheckoutItem[] {
  return (Array.isArray(cart) ? cart : []).slice(0, MAX_ITEMS).map((c) => ({
    name: clampLen(c.title || c.name || 'Produit', MAX_NAME),
    price: Math.max(0, toNumber(c.price, 0)),
    quantity: clampInt(c.quantity ?? c.qty ?? 1, 1, 1),
    image: c.image ? clampLen(c.image, MAX_IMAGE) : undefined,
    currency: normalizeSupportedCurrency(c.currency || 'EUR'),
  }))
}

export async function createCheckoutSessionFromCart(args: {
  email: string
  address: string
  cart: Array<{
    title?: string
    name?: string
    price?: number
    quantity?: number
    qty?: number
    image?: string
    currency?: string
  }>
  currency?: IsoCurrency
  locale?: string
  idempotencyKey?: string
  metadata?: Record<string, string>
}): Promise<CheckoutResponse> {
  const items = buildCheckoutItemsFromCart(args.cart)

  return createCheckoutSession({
    email: args.email,
    address: args.address,
    items,
    currency: normalizeSupportedCurrency(args.currency || 'EUR'),
    locale: args.locale,
    idempotencyKey: args.idempotencyKey,
    metadata: args.metadata,
  })
}

export async function createCheckoutSession(
  input: CreateCheckoutInput
): Promise<CheckoutResponse> {
  const currency: SupportedCurrency = normalizeSupportedCurrency(input.currency || 'EUR')

  const payload = {
    email: String(input.email || '').trim(),
    address: String(input.address || '').trim(),
    items: (input.items || []).slice(0, MAX_ITEMS).map((i) => ({
      name: clampLen(i.name || 'Produit', MAX_NAME),
      price: Math.max(0, toNumber(i.price, 0)),
      quantity: clampInt(i.quantity, 1, 1),
      image: i.image ? clampLen(i.image, MAX_IMAGE) : undefined,
      currency,
    })),
    currency,
    locale: safeLocale(input.locale),
    idempotencyKey: input.idempotencyKey,
    metadata: sanitizeMetadata(input.metadata),
  } satisfies {
    email: string
    address: string
    items: {
      name: string
      price: number
      quantity: number
      image?: string
      currency: SupportedCurrency
    }[]
    currency: SupportedCurrency
    locale: string
    idempotencyKey?: string
    metadata?: Record<string, string>
  }

  if (!payload.email) throw new Error('Email requis')
  if (!payload.address) throw new Error('Adresse requise')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const idem = payload.idempotencyKey || buildIdempotencyKey(payload)

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-idempotency-key': idem,
      'x-locale': payload.locale,
      'x-currency': payload.currency,
    }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: 'no-store',
      keepalive: true,
    })

    let data: unknown
    try {
      data = await res.json()
    } catch {
      data = { error: 'Réponse invalide du serveur' }
    }

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('Trop de tentatives. Réessayez dans une minute.')
      }
      const msg =
        isRecord(data) && typeof data.error === 'string'
          ? data.error
          : `Échec création session (HTTP ${res.status})`
      throw new Error(msg)
    }

    return isRecord(data) ? (data as CheckoutResponse) : {}
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Délai dépassé lors de la création de la session')
    }

    throw err instanceof Error
      ? err
      : new Error('Erreur inconnue lors du checkout')
  } finally {
    clearTimeout(timeoutId)
  }
}

function sanitizeMetadata(
  meta?: Record<string, string>
): Record<string, string> | undefined {
  if (!meta) return undefined

  const out: Record<string, string> = {}
  const entries = Object.entries(meta).slice(0, 20)

  for (const [k, v] of entries) {
    const key = clampLen(k, 40)
    const val = clampLen(v, 200)
    if (key) out[key] = val
  }

  return out
}

export default createCheckoutSession