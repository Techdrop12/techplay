// src/lib/ga4.js
// Utilise gtag si présent, sinon fallback Measurement Protocol côté client
// (nécessite NEXT_PUBLIC_GA_MEASUREMENT_ID + GA_API_SECRET si fallback)

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const API_SECRET = process.env.GA_API_SECRET // ⚠️ si utilisé côté client, faible exposition

function hasGtag() {
  return typeof window !== 'undefined' && typeof window.gtag === 'function'
}

/**
 * @param {string} name
 * @param {Record<string, any>} [params]
 */
export function logGa4Event(name, params = {}) {
  if (!name) return
  // 1) gtag direct
  if (hasGtag()) {
    try { window.gtag('event', name, params) } catch {}
    return
  }

  // 2) Fallback MP (optionnel)
  if (typeof navigator === 'undefined' || !MEASUREMENT_ID || !API_SECRET) return
  try {
    const cid = getOrCreateCid()
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`
    const body = JSON.stringify({
      client_id: cid,
      events: [{ name, params }],
    })
    navigator.sendBeacon(url, body)
  } catch {}
}

function getOrCreateCid() {
  try {
    const k = '_ga_cid'
    const ls = typeof localStorage !== 'undefined' ? localStorage : null
    if (!ls) return String(Math.random())
    let v = ls.getItem(k)
    if (!v) { v = crypto?.randomUUID?.() || String(Math.random()); ls.setItem(k, v) }
    return v
  } catch {
    return String(Math.random())
  }
}
