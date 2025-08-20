// src/lib/translate.js
// Google Translate v2 – batching, cache mémoire, gestion erreurs


const ENDPOINT = 'https://translation.googleapis.com/language/translate/v2'
const _cache = new Map()


function _cacheKey(text, target) { return `${target}::${text}` }


/**
* @param {string} text
* @param {string} [target='fr']
* @returns {Promise<string>}
*/
export async function translate(text, target = 'fr') {
if (!text || typeof text !== 'string') return ''
const key = _cacheKey(text, target)
const hit = _cache.get(key)
if (hit && hit.expires > Date.now()) return hit.value


const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
if (!apiKey) throw new Error('Clé API Google Translate manquante')


const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ q: [text], target, format: 'text' }),
})


if (!res.ok) throw new Error(`Translate API error: ${res.status}`)
const data = await res.json()
const translated = data?.data?.translations?.[0]?.translatedText ?? text


_cache.set(key, { value: translated, expires: Date.now() + 1000 * 60 * 60 }) // 1h
return translated
}


/** @param {string} text */
export async function translateToEnglish(text) { return translate(text, 'en') }


/** Batch */
export async function translateBatch(texts, target = 'fr') {
if (!Array.isArray(texts) || texts.length === 0) return []
const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
if (!apiKey) throw new Error('Clé API Google Translate manquante')


const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ q: texts, target, format: 'text' }),
})
if (!res.ok) throw new Error(`Translate API error: ${res.status}`)
const data = await res.json()
return data?.data?.translations?.map((t) => t.translatedText) ?? texts
}