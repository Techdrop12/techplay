import {getRequestConfig} from 'next-intl/server'

import loadMessages from './loadMessages'

// Locales supportées
export const languages = ['fr', 'en'] as const
export type Locale = (typeof languages)[number]
export const defaultLocale: Locale = 'fr'

export function isLocale(x: unknown): x is Locale {
  return typeof x === 'string' && languages.includes(x as Locale)
}

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale

  if (!isLocale(locale)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: await loadMessages(locale),
  }
})