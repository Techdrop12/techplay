/**
 * Détection et type de devise pour e-commerce (une seule source de vérité).
 * Utilisé par checkout, panier, analytics et commande.
 */

export type Currency = 'EUR' | 'GBP' | 'USD'

/**
 * Détecte la devise à partir du document/navigator ou d’un hint de locale.
 * @param localeOrSource - Optionnel : locale (e.g. "en", "fr") ou chaîne type navigator.language
 */
export function detectCurrency(localeOrSource?: string): Currency {
  try {
    const source = (
      localeOrSource ??
      (typeof document !== 'undefined' ? document.documentElement?.lang : '') ??
      (typeof navigator !== 'undefined' ? navigator.language : '') ??
      ''
    )
      .trim()
      .toLowerCase()

    if (source.includes('gb') || source.endsWith('-uk') || source === 'uk') return 'GBP'
    if (source.includes('us') || source.startsWith('en')) return 'USD'
    return 'EUR'
  } catch {
    return 'EUR'
  }
}
