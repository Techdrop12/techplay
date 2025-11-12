// src/i18n/config.ts
import {getRequestConfig} from 'next-intl/server'

// Locales supportées (mêmes que lib/language.ts)
export const languages = ['fr', 'en'] as const
export type Locale = (typeof languages)[number]
export const defaultLocale: Locale = 'fr'

export function isLocale(x: unknown): x is Locale {
  return typeof x === 'string' && (languages as readonly string[]).includes(x as any)
}

// Si un jour tu ajoutes des messages, charge-les ici.
async function loadMessages(_locale: Locale) {
  // ex: return (await import(`./messages/${_locale}.json`)).default
  return {}
}

// Hook pour next-intl (App Router)
export default getRequestConfig(async ({locale}) => {
  const l = isLocale(locale) ? locale : defaultLocale
  return {messages: await loadMessages(l)}
})
