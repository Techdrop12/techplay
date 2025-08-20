// src/lib/validateBody.js
// Sanitizer/validator léger pour routes API (préférer Zod quand possible)


/**
* @template T
* @param {Record<string, any>} body
* @param {string[]} [required=[]] Champs requis
* @param {{ allowedKeys?: string[]; allowEmpty?: boolean }} [options]
* @returns {T}
*/
export function validateBody(body, required = [], options = {}) {
if (!body || typeof body !== 'object') throw new Error('Invalid JSON body')
const { allowedKeys = null, allowEmpty = false } = options


for (const key of required) {
const value = body[key]
if (
value === undefined ||
value === null ||
(!allowEmpty && typeof value === 'string' && value.trim() === '')
) {
throw new Error(`Missing required field: ${key}`)
}
}


// Supprime les clés non autorisées si allowedKeys est fourni
if (Array.isArray(allowedKeys)) {
for (const k of Object.keys(body)) {
if (!allowedKeys.includes(k)) delete body[k]
}
}


// Assainit les strings (trim + suppr. caractères de contrôle + limite taille)
for (const [k, v] of Object.entries(body)) {
if (typeof v === 'string') {
body[k] = v.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 10000)
}
}


return /** @type {T} */ (body)
}


export default validateBody