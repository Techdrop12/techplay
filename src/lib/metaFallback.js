// src/lib/metaFallback.js — description SEO de secours à partir du produit
export function getFallbackDescription(product = {}) {
  const { title, brand, description, price, currency = 'EUR' } = product || {}
  const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency })

  let parts = []
  if (title) parts.push(`Découvrez ${title}`)
  if (brand) parts.push(`de la marque ${brand}`)
  let out = parts.join(' ')
  if (price != null && price !== '') out += ` à partir de ${fmt.format(Number(price))}`
  out += ' sur TechPlay. Livraison rapide et SAV premium.'

  if (typeof description === 'string' && description.trim()) {
    const clean = strip(description)
    const snippet = clean.length > 160 ? clean.slice(0, 157) + '…' : clean
    out += ' ' + snippet
  }
  return out
}
function strip(s) {
  return String(s)
    .replace(/<[^>]+>/g, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
