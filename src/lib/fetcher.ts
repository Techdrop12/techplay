// src/lib/fetcher.ts
export type FetcherInit = RequestInit & { retries?: number; retryDelayMs?: number; timeoutMs?: number }
export async function fetcher<T = unknown>(url: string, init: FetcherInit = {}): Promise<T> {
  const { retries = 1, retryDelayMs = 300, timeoutMs, ...rest } = init
  const controller = new AbortController()
  const to = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null

  let lastErr: any
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...rest, signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const ct = res.headers.get('content-type') || ''
      const data = ct.includes('application/json') ? await res.json() : await res.text()
      if (to) clearTimeout(to)
      return data as T
    } catch (e) {
      lastErr = e
      if (attempt < retries) await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)))
    }
  }
  throw lastErr || new Error('Network error')
}
