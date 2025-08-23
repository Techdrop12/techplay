// src/lib/ab-test.ts
// ✅ Utilitaire A/B générique avec persistance + TTL + override URL + helpers

export type ABOpts = {
  ttlDays?: number
  /** clé de stockage (LS par défaut) */
  storage?: 'local' | 'session'
  /** permet d'autoriser un override via URL ?ab-<name>=<variant> (par défaut true) */
  allowUrlOverride?: boolean
}

const isBrowser = typeof window !== 'undefined'

function getStore(storage: ABOpts['storage']) {
  if (!isBrowser) return null
  try {
    return storage === 'session' ? window.sessionStorage : window.localStorage
  } catch {
    return null
  }
}

export function getABVariant(
  name: string,
  variants: string[],
  opts: ABOpts = {}
): string {
  const ttlDays = opts.ttlDays ?? 90
  const allowUrlOverride = opts.allowUrlOverride ?? true
  const store = getStore(opts.storage)

  // SSR: choix non persistant
  if (!isBrowser) {
    return variants[Math.floor(Math.random() * variants.length)]
  }

  const key = `ab-${name}`
  const now = Date.now()

  // 1) Override via URL (?ab-name=variant) pratique pour QA
  if (allowUrlOverride) {
    try {
      const usp = new URLSearchParams(window.location.search)
      const urlKey = `ab-${name}`
      if (usp.has(urlKey)) {
        const forced = String(usp.get(urlKey))
        if (variants.includes(forced)) {
          store?.setItem(key, JSON.stringify({ v: forced, ts: now }))
          return forced
        }
      }
    } catch {}
  }

  // 2) Lecture stockage (si pas expiré et toujours valide)
  try {
    const raw = store?.getItem(key)
    if (raw) {
      const { v, ts } = JSON.parse(raw)
      if (now - ts < ttlDays * 864e5 && variants.includes(v)) return v
    }
  } catch {}

  // 3) Nouveau tirage
  const chosen = variants[Math.floor(Math.random() * variants.length)]
  try {
    store?.setItem(key, JSON.stringify({ v: chosen, ts: now }))
  } catch {}
  return chosen
}

/** Force un variant (outil debug / QA). */
export function setABVariant(name: string, variant: string, opts: ABOpts = {}) {
  const store = getStore(opts.storage)
  if (!isBrowser || !store) return
  try {
    store.setItem(`ab-${name}`, JSON.stringify({ v: variant, ts: Date.now() }))
  } catch {}
}

/** Supprime l’assignation stockée (re‐tirage au prochain appel). */
export function clearABVariant(name: string, opts: ABOpts = {}) {
  const store = getStore(opts.storage)
  if (!isBrowser || !store) return
  try {
    store.removeItem(`ab-${name}`)
  } catch {}
}
