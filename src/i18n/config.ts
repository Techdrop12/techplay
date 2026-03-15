import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

import loadMessages from './loadMessages'
import { LOCALE_COOKIE } from '@/lib/language'

// Locales supportées
export const languages = ['fr', 'en'] as const
export type Locale = (typeof languages)[number]
export const defaultLocale: Locale = 'fr'

export function isLocale(x: unknown): x is Locale {
  return typeof x === 'string' && languages.includes(x as Locale)
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Routes sans [locale] dans le path (ex: /commande, /contact, /blog) : utiliser le cookie
  if (!isLocale(locale)) {
    const cookieStore = await cookies()
    const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value
    locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale
  }

  return {
    locale,
    messages: await loadMessages(locale),
  }
})