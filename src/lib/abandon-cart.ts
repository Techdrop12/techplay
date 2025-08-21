// src/lib/abandon-cart.ts
// ✅ Envoi “panier abandonné” avec retry, backoff, AbortController, dédup 24h

export type CartItem = {
  id: string
  title: string
  price: number
  quantity: number
  image?: string
  imageUrl?: string
}

type Payload = { email: string; cart: Array<Omit<CartItem, 'image'> & { imageUrl?: string }> }

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

export async function sendAbandonCartReminder(email: string, cart: CartItem[]) {
  if (!email || cart.length === 0) return
  if (!canSend()) return

  const controller = new AbortController()

  // normalise image -> imageUrl pour l’API
  const normalizedCart: Payload['cart'] = cart.map(({ image, imageUrl, ...rest }) => ({
    ...rest,
    ...(imageUrl ? { imageUrl } : image ? { imageUrl: image } : {}),
  }))

  const body: Payload = { email, cart: normalizedCart }

  const doFetch = async (attempt: number): Promise<Response> => {
    const timeout = setTimeout(() => controller.abort(), 8000)
    try {
      const res = await fetch('/api/brevo/abandon-panier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res
    } finally {
      clearTimeout(timeout)
    }
  }

  let lastErr: any
  for (let i = 0; i < 2; i++) {
    try {
      const res = await doFetch(i)
      markSent()
      return await res.json().catch(() => ({}))
    } catch (e) {
      lastErr = e
      await new Promise((r) => setTimeout(r, 400 * (i + 1)))
    }
  }
  // eslint-disable-next-line no-console
  console.warn('[abandon-cart] échec envoi :', lastErr)
}
