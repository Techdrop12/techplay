// src/lib/abandon-cart.ts
// Envoi “panier abandonné” avec retry, backoff, AbortController, dédup 24h

export type CartItem = {
  id: string
  title: string
  price: number
  quantity: number
  image?: string
  imageUrl?: string
}

type Payload = {
  email: string
  cart: Array<Omit<CartItem, 'image'> & { imageUrl?: string }>
}

type AbandonCartResponse = Record<string, unknown>

import { warn } from '@/lib/logger'

const DEDUP_KEY = 'abandon_cart_last_send'
const DEDUP_MS = 24 * 60 * 60 * 1000

function canSend(): boolean {
  if (typeof window === 'undefined') return true

  try {
    const ts = Number(localStorage.getItem(DEDUP_KEY) || 0)
    return Date.now() - ts > DEDUP_MS
  } catch {
    return true
  }
}

function markSent() {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(DEDUP_KEY, String(Date.now()))
  } catch {}
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

async function doFetch(body: Payload): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch('/api/brevo/abandon-panier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: 'no-store',
      keepalive: true,
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    return res
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function sendAbandonCartReminder(
  email: string,
  cart: CartItem[]
): Promise<AbandonCartResponse | void> {
  if (!email || cart.length === 0) return
  if (!canSend()) return

  const normalizedCart: Payload['cart'] = cart.map(({ image, imageUrl, ...rest }) => ({
    ...rest,
    ...(imageUrl ? { imageUrl } : image ? { imageUrl: image } : {}),
  }))

  const body: Payload = { email, cart: normalizedCart }

  let lastError: unknown

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await doFetch(body)
      markSent()
      return (await res.json().catch(() => ({}))) as AbandonCartResponse
    } catch (error) {
      lastError = error
      if (attempt < 1) {
        await sleep(400 * (attempt + 1))
      }
    }
  }

  warn('[abandon-cart] échec envoi :', lastError)
}