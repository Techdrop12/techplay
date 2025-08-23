// src/lib/checkout.ts — FINAL (Stripe Checkout client helper)
// - Types stricts + validation douce
// - Idempotency key stable + salt sécurisé
// - Normalisation devise/locale
// - Abort/timeout, keepalive, no-store
// - Helpers pour construire les items depuis le panier
// - Rétro-compatibilité avec ton code existant

/* ============================== Types ============================== */

export type IsoCurrency =
  | 'EUR' | 'USD' | 'GBP' | 'CHF' | 'CAD' | 'AUD' | 'JPY' | 'BRL' | 'MXN' | 'SEK' | 'NOK' | 'DKK'
  | string // on laisse ouvert si d’autres devises sont utiles côté Stripe

export type CheckoutItem = {
  /** Nom/label affiché côté Stripe */
  name: string
  /** Prix unitaire (majoritairement TTC côté front); l’API serveur devra savoir si HT/TTC */
  price: number
  /** Quantité entière >= 1 */
  quantity: number
  /** URL image (facultatif) */
  image?: string
  /** Devise ISO 4217 (par défaut EUR) */
  currency?: IsoCurrency
}

export type CreateCheckoutInput = {
  email: string
  address: string
  items?: CheckoutItem[]             // si omis, le serveur peut reconstruire depuis session/cart
  currency?: IsoCurrency             // fallback 'EUR'
  locale?: string                    // ex: 'fr', 'fr-FR' ; fallback auto
  idempotencyKey?: string            // si fourni, on respecte
  metadata?: Record<string, string>  // facultatif: pass-through jusqu’au serveur
}

export type CheckoutResponse = {
  id?: string
  url?: string
  [k: string]: unknown
}

/* ============================== Constantes ============================== */

const TIMEOUT_MS = 15_000
const MAX_ITEMS = 100
const MAX_NAME = 180
const MAX_IMAGE = 512

/* ============================== Utils ============================== */

/** FNV-1a (32-bit) — rapide, stable */
function hashFnv1a(str: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return (h >>> 0).toString(16)
}

function clampInt(n: unknown, min: number, def = min) {
  const v = Math.floor(Number(n))
  if (!Number.isFinite(v)) return def
  return Math.max(min, v)
}

function toNumber(n: unknown, def = 0) {
  const v = Number(n)
  return Number.isFinite(v) ? v : def
}

function clampLen(s: unknown, max: number) {
  const v = String(s ?? '')
  return v.length > max ? v.slice(0, max) : v
}

/** Tri clé/valeur récursif pour un JSON stable (objets/arrays) */
function stableStringify(x: any): string {
  if (x === null || typeof x !== 'object') return JSON.stringify(x)
  if (Array.isArray(x)) return `[${x.map(stableStringify).join(',')}]`
  const keys = Object.keys(x).sort()
  const entries = keys.map((k) => `${JSON.stringify(k)}:${stableStringify(x[k])}`)
  return `{${entries.join(',')}}`
}

/** Locale navigateur -> 'fr' | 'fr-FR'… (fallback 'fr') */
function safeLocale(l?: string) {
  if (l && typeof l === 'string' && l.length <= 10) return l
  if (typeof navigator !== 'undefined') {
    const cand = navigator.language || (navigator as any).userLanguage
    if (cand) return String(cand).slice(0, 10)
  }
  return 'fr'
}

/** Normalise une devise en ISO uppercase, fallback EUR */
function normalizeCurrency(c?: string): IsoCurrency {
  const v = String(c || '').trim().toUpperCase()
  if (!v) return 'EUR'
  // Laisse passer tout code 3 lettres ; Stripe validera côté serveur
  return /^[A-Z]{3}$/.test(v) ? (v as IsoCurrency) : 'EUR'
}

/** Idempotency key stable pour un payload + salt aléatoire */
function buildIdempotencyKey(payload: Omit<CreateCheckoutInput, 'idempotencyKey'>): string {
  const base = stableStringify({
    email: payload.email,
    address: payload.address,
    items: (payload.items || []).map((i) => ({
      name: i.name, price: i.price, quantity: i.quantity, image: i.image, currency: i.currency,
    })),
    currency: normalizeCurrency(payload.currency),
    locale: safeLocale(payload.locale),
    metadata: payload.metadata || {},
  })

  // Salt aléatoire crypto-safe si dispo
  let salt = ''
  try {
    if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
      const arr = new Uint32Array(2)
      crypto.getRandomValues(arr)
      salt = `${arr[0].toString(16)}${arr[1].toString(16)}`
    } else if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      salt = (crypto as any).randomUUID()
    } else {
      salt = Math.random().toString(16).slice(2)
    }
  } catch {
    salt = Math.random().toString(16).slice(2)
  }

  return `${hashFnv1a(base)}_${hashFnv1a(salt)}`
}

/* ===================== Builders / Helpers cart -> items ===================== */

/** Construire les items depuis un panier “souple” (différents schémas possibles) */
export function buildCheckoutItemsFromCart(
  cart: Array<{ title?: string; name?: string; price?: number; quantity?: number; qty?: number; image?: string; currency?: string }>
): CheckoutItem[] {
  return (Array.isArray(cart) ? cart : []).slice(0, MAX_ITEMS).map((c) => ({
    name: clampLen(c.title || c.name || 'Produit', MAX_NAME),
    price: Math.max(0, toNumber(c.price, 0)),
    quantity: clampInt(c.quantity ?? c.qty ?? 1, 1, 1),
    image: c.image ? clampLen(c.image, MAX_IMAGE) : undefined,
    currency: normalizeCurrency(c.currency || 'EUR'),
  }))
}

/** Variante pratique: construit items depuis le local cart + appelle createCheckoutSession */
export async function createCheckoutSessionFromCart(args: {
  email: string
  address: string
  cart: Array<{ title?: string; name?: string; price?: number; quantity?: number; qty?: number; image?: string; currency?: string }>
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
    currency: args.currency,
    locale: args.locale,
    idempotencyKey: args.idempotencyKey,
    metadata: args.metadata,
  })
}

/* ============================== API call ============================== */

/**
 * Crée une session Stripe Checkout via l’API `/api/checkout`.
 * - Retourne { id, url } si OK.
 * - Lance une Error descriptive si KO / timeout.
 */
export async function createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutResponse> {
  // Normalisation & validation douce
  const payload: CreateCheckoutInput = {
    email: String((input.email || '')).trim(),
    address: String((input.address || '')).trim(),
    items: (input.items || [])
      .slice(0, MAX_ITEMS)
      .map((i) => ({
        name: clampLen(i.name || 'Produit', MAX_NAME),
        price: Math.max(0, toNumber(i.price, 0)),
        quantity: clampInt(i.quantity, 1, 1),
        image: i.image ? clampLen(i.image, MAX_IMAGE) : undefined,
        currency: normalizeCurrency(i.currency || input.currency || 'EUR'),
      })),
    currency: normalizeCurrency(input.currency || 'EUR'),
    locale: safeLocale(input.locale),
    idempotencyKey: input.idempotencyKey, // on laisse passer si fourni
    metadata: sanitizeMetadata(input.metadata),
  }

  if (!payload.email) throw new Error('Email requis')
  if (!payload.address) throw new Error('Adresse requise')

  // Abort/timeout
  const controller = new AbortController()
  const to = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const idem = payload.idempotencyKey || buildIdempotencyKey(payload)

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-idempotency-key': idem,
        'x-locale': payload.locale || 'fr',
        'x-currency': payload.currency || 'EUR',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: 'no-store',
      keepalive: true, // utile si l’utilisateur quitte la page juste après
    })

    let data: any
    try {
      data = await res.json()
    } catch {
      data = { error: 'Réponse invalide du serveur' }
    }

    if (!res.ok) {
      const msg = data?.error || `Échec création session (HTTP ${res.status})`
      throw new Error(msg)
    }

    return data as CheckoutResponse
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Délai dépassé lors de la création de la session')
    }
    throw err instanceof Error ? err : new Error('Erreur inconnue lors du checkout')
  } finally {
    clearTimeout(to)
  }
}

function sanitizeMetadata(meta?: Record<string, string>): Record<string, string> | undefined {
  if (!meta) return undefined
  const out: Record<string, string> = {}
  const entries = Object.entries(meta).slice(0, 20) // limite de champs raisonnable
  for (const [k, v] of entries) {
    const key = clampLen(k, 40)
    const val = clampLen(v, 200)
    if (key) out[key] = val
  }
  return out
}

export default createCheckoutSession
