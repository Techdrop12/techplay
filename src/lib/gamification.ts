// src/lib/gamification.ts
export type GamEvent =
  | 'view_product'
  | 'add_to_cart'
  | 'purchase'
  | 'share'
  | 'review'
  | (string & {})

const POINTS: Record<GamEvent, number> = {
  view_product: 1,
  add_to_cart: 5,
  purchase: 25,
  share: 4,
  review: 10,
}

const KEY = 'tp_gamification'
type State = { score: number; lastUpdate: number }
const now = () => Date.now()

function load(): State {
  try {
    if (typeof localStorage === 'undefined') return { score: 0, lastUpdate: now() }
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : { score: 0, lastUpdate: now() }
  } catch {
    return { score: 0, lastUpdate: now() }
  }
}
function save(s: State) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(KEY, JSON.stringify(s))
    }
  } catch {}
}

/**
 * Récupère le score utilisateur.
 * `_userId` est optionnel et ignoré pour l’instant (compat route API).
 * Côté serveur (où localStorage n’existe pas), on retourne 0.
 */
export function getUserScore(_userId?: string): number {
  return load().score
}

export function grant(event: GamEvent, qty = 1): number {
  const s = load()
  const delta = (POINTS[event] ?? 0) * Math.max(1, qty)
  s.score += delta
  s.lastUpdate = now()
  save(s)
  return s.score
}

export function level(score = getUserScore()) {
  // paliers simples : 0-99 bronze, 100-249 silver, 250+ gold
  if (score >= 250) return 'gold'
  if (score >= 100) return 'silver'
  return 'bronze'
}
