// src/i18n/loadMessages.ts
import { defaultLocale, type Locale, isLocale } from './config'
import type { AbstractIntlMessages } from 'next-intl'

export type Messages = AbstractIntlMessages

export default async function loadMessages(locale: string): Promise<Messages> {
  const loc: Locale = isLocale(locale) ? (locale as Locale) : defaultLocale

  try {
    const mod = (await import(`../../messages/${loc}.json`)) as { default: Messages }
    return mod.default
  } catch {
    if (loc !== defaultLocale) {
      try {
        const fallback = (await import(`../../messages/${defaultLocale}.json`)) as { default: Messages }
        return fallback.default
      } catch {
        return {} as Messages
      }
    }
    return {} as Messages
  }
}
