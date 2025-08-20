// src/lib/recentProducts.js — gestion produits vus récemment (localStorage)
const KEY = 'recentlyViewed'
const DEFAULT_MAX = 8
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 jours


function safeLS() {
try { if (typeof window === 'undefined') return null; return window.localStorage } catch { return null }
}


export function getRecentlyViewed({ max = DEFAULT_MAX } = {}) {
const ls = safeLS(); if (!ls) return []
try {
const raw = ls.getItem(KEY)
if (!raw) return []
const { items = [] } = JSON.parse(raw)
const now = Date.now()
return items
.filter((x) => !x.expires || x.expires > now)
.map((x) => x.data)
.slice(-max)
} catch { return [] }
}


export function addRecentlyViewed(product, { idKey = '_id', max = DEFAULT_MAX, ttlMs = DEFAULT_TTL_MS } = {}) {
const ls = safeLS(); if (!ls || !product) return
try {
const raw = ls.getItem(KEY)
const now = Date.now()
const entry = { data: product, id: product?.[idKey], expires: ttlMs ? now + ttlMs : undefined }
let items = []
if (raw) items = JSON.parse(raw).items || []
items = items.filter((x) => x.id !== entry.id) // dedupe
items.push(entry)
if (items.length > max) items = items.slice(-max)
ls.setItem(KEY, JSON.stringify({ items }))
dispatchEvent(new CustomEvent('recently-viewed:add', { detail: entry }))
} catch {}
}


export function removeRecentlyViewed(id) {
const ls = safeLS(); if (!ls) return
try {
const raw = ls.getItem(KEY); if (!raw) return
let { items = [] } = JSON.parse(raw)
items = items.filter((x) => x.id !== id)
ls.setItem(KEY, JSON.stringify({ items }))
} catch {}
}


export function clearRecentlyViewed() {
const ls = safeLS(); if (!ls) return
try { ls.removeItem(KEY) } catch {}
}