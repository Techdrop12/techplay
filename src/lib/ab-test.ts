// src/lib/ab-test.ts
// ✅ Utilitaire A/B générique avec persistance + TTL + clé distincte par test

export type ABOpts = { ttlDays?: number }

export function getABVariant(name: string, variants: string[], opts: ABOpts = {}) {
  const ttlDays = opts.ttlDays ?? 90

  if (typeof window === 'undefined') {
    // SSR: choix non persistant
    return variants[Math.floor(Math.random() * variants.length)]
  }

  const key = `ab-${name}`
  const now = Date.now()

  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const { v, ts } = JSON.parse(raw)
      if (now - ts < ttlDays * 864e5 && variants.includes(v)) return v
    }
  } catch {}

  const chosen = variants[Math.floor(Math.random() * variants.length)]
  try {
    localStorage.setItem(key, JSON.stringify({ v: chosen, ts: now }))
  } catch {}
  return chosen
}
