// src/i18n/config.ts
// Re-exports to keep ONE source of truth

export {
  languages as locales,
  DEFAULT_LOCALE as defaultLocale,
  LOCALE_COOKIE,
  type Locale,
  type AppLocale,
  isLocale,
  normalizeLocale,
  extractLocaleFromPath,
  withLocale,
  localeLabels,
  toLangTag,
} from '@/lib/language'

// (Si tu utilises next-intl v3/v4)
export const localePrefix = 'always' as const
