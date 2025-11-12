// src/lib/api-client.ts
// ✅ Client fetch typé avec retry, AbortController, gestion d’erreurs JSON

type Json = Record<string, any>

async function fetchJSON<T>(
  url: string,
  init: RequestInit & { retries?: number; timeoutMs?: number } = {}
): Promise<T> {
  const { retries = 1, timeoutMs = 8000, ...rest } = init
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), timeoutMs)

  try {
    const res = await fetch(url, { ...rest, signal: ac.signal })
    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText)
      throw new Error(`HTTP ${res.status} – ${msg}`)
    }
    return (await res.json()) as T
  } catch (e) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 400))
      return fetchJSON<T>(url, { ...rest, retries: retries - 1, timeoutMs })
    }
    throw e
  } finally {
    clearTimeout(timer)
  }
}

export type PostReviewPayload = {
  productId: string
  rating: number
  comment: string
  recaptchaToken?: string
}

export type PostReviewResponse = {
  ok: true
  id: string
  createdAt: string
} | {
  ok: false
  error: string
}

export async function postReview(payload: PostReviewPayload): Promise<PostReviewResponse> {
  return fetchJSON<PostReviewResponse>('/api/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    retries: 2,
    timeoutMs: 10000,
  })
}
