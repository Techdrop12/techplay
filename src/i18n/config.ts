// src/i18n/config.ts — request config + utilitaires (FINAL)

import {getRequestConfig} from 'next-intl/server'

export const locales = ['fr', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'fr'
export const isLocale = (l: string): l is Locale =>
  (locales as readonly string[]).includes(l)

// ⚠️ export par défaut exigé par `next-intl/plugin`
// Charge les messages JSON en fonction de la locale de la requête
export default getRequestConfig(async ({locale}) => {
  const safe =
    (locales as readonly string[]).includes(locale as string) ? (locale as Locale) : defaultLocale

  const messages = (await import(`../messages/${safe}.json`)).default
  return {messages}
})
