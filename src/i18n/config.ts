import { getRequestConfig } from 'next-intl/server'

// Locales supportées (alignées avec lib/language.ts)
export const languages = ['fr', 'en'] as const
export type Locale = (typeof languages)[number]
export const defaultLocale: Locale = 'fr'

export function isLocale(x: unknown): x is Locale {
  return typeof x === 'string' && languages.includes(x as Locale)
}

// Si un jour tu ajoutes des messages, charge-les ici.
async function loadMessages(_locale: Locale): Promise<Record<string, string>> {
  // ex: return (await import(`./messages/${_locale}.json`)).default
  return {}
}

// Hook pour next-intl (App Router)
export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale: Locale = isLocale(locale) ? locale : defaultLocale

  return {
    locale: resolvedLocale,
    messages: await loadMessages(resolvedLocale),
  }
})