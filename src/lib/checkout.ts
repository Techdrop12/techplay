// src/lib/checkout.ts

// ---------- Types ----------
export type CheckoutItem = {
  name: string
  price: number
  quantity: number
  image?: string
  currency?: string // par défaut: EUR
}

export type CreateCheckoutInput = {
  email: string
  address: string
  items?: CheckoutItem[]
  currency?: string
  locale?: string
  /** Clé d’idempotence optionnelle (sinon générée côté client) */
  idempotencyKey?: string
}

export type CheckoutResponse = {
  id?: string
  url?: string
  [k: string]: unknown
}

// ---------- Utils ----------
const TIMEOUT_MS = 15_000

// FNV-1a hash (stable en browser, sans dépendance)
function hashFnv1a(str: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return (h >>> 0).toString(16)
}

function canonicalize(obj: unknown) {
  return JSON.stringify(obj, Object.keys(obj as any).sort())
}

/**
 * Génère une clé d’idempotence DÉTERMINISTE basée sur le payload.
 * (pas de suffixe aléatoire, sinon on casse l’idempotence)
 */
function buildIdempotencyKey(payload: CreateCheckoutInput): string {
  const base = canonicalize({
    email: payload.email,
    address: payload.address,
    items: (payload.items || []).map((i) => ({
      name: i.name, price: i.price, quantity: i.quantity, image: i.image, currency: (i.currency || 'EUR').toUpperCase(),
    })),
    currency: (payload.currency || 'EUR').toUpperCase(),
    locale: payload.locale || 'fr',
  })
  return hashFnv1a(base)
}

export function buildCheckoutItemsFromCart(
  cart: Array<{ title: string; price: number; quantity?: number; image?: string }>
): CheckoutItem[] {
  return (cart || []).map((c) => ({
    name: c.title || 'Produit',
    price: Number(c.price) || 0,
    quantity: Math.max(1, Number(c.quantity || 1)),
    image: c.image,
    currency: 'EUR',
  }))
}

// ---------- API call ----------
export async function createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutResponse> {
  const payload: CreateCheckoutInput = {
    email: (input.email || '').trim(),
    address: (input.address || '').trim(),
    items: input.items?.map((i) => ({
      name: i.name,
      price: Number(i.price) || 0,
      quantity: Math.max(1, Number(i.quantity || 1)),
      image: i.image,
      currency: (i.currency || input.currency || 'EUR').toUpperCase(),
    })),
    currency: (input.currency || 'EUR').toUpperCase(),
    locale:
      input.locale ||
      (typeof navigator !== 'undefined' ? navigator.language?.slice(0, 2) : 'fr') ||
      'fr',
    idempotencyKey: input.idempotencyKey,
  }

  if (!payload.email) throw new Error('Email requis')
  if (!payload.address) throw new Error('Adresse requise')

  // Idempotency: déterministe si non fourni
  const idem = payload.idempotencyKey || buildIdempotencyKey(payload)

  const controller = new AbortController()
  const to = setTimeout(() => controller.abort(), TIMEOUT_MS)

  async function doFetch(): Promise<{ ok: boolean; status: number; data: any }> {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-idempotency-key': idem,
        'Accept-Language': payload.locale || 'fr',
      },
      body: JSON.stringify({ ...payload, idempotencyKey: idem }),
      signal: controller.signal,
      cache: 'no-store',
      keepalive: true,
    })
    let data: any
    try { data = await res.json() } catch { data = { error: 'Réponse invalide du serveur' } }
    return { ok: res.ok, status: res.status, data }
  }

  try {
    let { ok, status, data } = await doFetch()

    // Retry simple: 1x pour 5xx/transient
    if (!ok && status >= 500) {
      await new Promise((r) => setTimeout(r, 400))
      const again = await doFetch()
      ok = again.ok; status = again.status; data = again.data
    }

    if (!ok) {
      throw new Error(data?.error || `Échec création session (HTTP ${status})`)
    }

    return data as CheckoutResponse
  } catch (err: any) {
    if (err?.name === 'AbortError') throw new Error('Délai dépassé lors de la création de la session')
    throw err instanceof Error ? err : new Error('Erreur inconnue lors du checkout')
  } finally {
    clearTimeout(to)
  }
}

export default createCheckoutSession
