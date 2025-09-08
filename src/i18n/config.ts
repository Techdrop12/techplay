// src/i18n/config.ts
// Re-exports to keep ONE source of truth for locales

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
  toOgLocale,
} from '@/lib/language'

// ✅ next-intl v3/v4 : FR sans préfixe, EN avec préfixe
export const localePrefix = 'as-needed' as const
