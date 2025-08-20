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
  idempotencyKey?: string // optionnel: peut être passé côté client
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
  // force unsigned 32-bit & to hex
  return (h >>> 0).toString(16)
}

function canonicalize(obj: unknown) {
  // JSON stable pour un hash reproductible
  return JSON.stringify(obj, Object.keys(obj as any).sort())
}

// Genère une idempotency key stable pour ce payload + une pincée d’aleatoire
function buildIdempotencyKey(payload: CreateCheckoutInput): string {
  const base = canonicalize({
    email: payload.email,
    address: payload.address,
    items: (payload.items || []).map((i) => ({
      name: i.name, price: i.price, quantity: i.quantity, image: i.image, currency: i.currency
    })),
    currency: payload.currency || 'EUR',
  })
  const rnd = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Math.random())
  return `${hashFnv1a(base)}_${hashFnv1a(rnd)}`
}

// Optionnel: construire les items depuis un panier local
export function buildCheckoutItemsFromCart(cart: Array<{ title: string; price: number; quantity?: number; image?: string }>): CheckoutItem[] {
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
    locale: input.locale || 'fr',
    idempotencyKey: input.idempotencyKey,
  }

  if (!payload.email) throw new Error('Email requis')
  if (!payload.address) throw new Error('Adresse requise')

  const controller = new AbortController()
  const to = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const idem = payload.idempotencyKey || buildIdempotencyKey(payload)

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-idempotency-key': idem,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: 'no-store',
      keepalive: true,
    })

    let data: CheckoutResponse | { error?: string; details?: unknown }
    try {
      data = await res.json()
    } catch {
      data = { error: 'Réponse invalide du serveur' }
    }

    if (!res.ok) {
      const msg =
        (data as any)?.error ||
        `Échec création session (HTTP ${res.status})`
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

export default createCheckoutSession
