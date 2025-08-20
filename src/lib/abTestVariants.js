// src/lib/abTestVariants.js
// ✅ Attribution A/B persistante (localStorage), TTL, SSR-safe fallback

'use client'

const KEY = 'ab_variant_v2'

export function getUserVariant(allowed = ['A', 'B'], ttlDays = 90) {
  if (typeof window === 'undefined') {
    // SSR: renvoie un choix pseudo-aléatoire non persistant
    return Math.random() < 0.5 ? allowed[0] : allowed[1] || allowed[0]
  }

  const now = Date.now()
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const { v, ts } = JSON.parse(raw)
      if (now - ts < ttlDays * 864e5 && allowed.includes(v)) return v
    }
  } catch {}

  const chosen = allowed[Math.floor(Math.random() * allowed.length)]
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: chosen, ts: now }))
  } catch {}
  return chosen
}
