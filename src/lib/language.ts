// src/lib/language.ts
// 💬 Lang config — Single Source of Truth (SSR/CSR safe)

export const languages = ['fr', 'en'] as const
export type Locale = (typeof languages)[number]
export type AppLocale = Locale

export const DEFAULT_LOCALE: Locale = 'fr'
export const LOCALE_COOKIE = 'NEXT_LOCALE'

export const localeLabels: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
}

/** Strict check on known locales */
export function isLocale(x: unknown): x is Locale {
  return typeof x === 'string' && (languages as readonly string[]).includes(x)
}

/** Normalize browser/user input → one of our supported locales */
export function normalizeLocale(x: unknown): Locale {
  if (isLocale(x)) return x
  if (typeof x === 'string') {
    const lower = x.toLowerCase()
    if (lower.startsWith('fr')) return 'fr'
    if (lower.startsWith('en')) return 'en'
  }
  return DEFAULT_LOCALE
}

/** Replace (or add) the locale prefix in a pathname (FR = no prefix) */
export function withLocale(pathname: string, locale: Locale): string {
  const re = new RegExp(`^/(?:${languages.join('|')})(?=/|$)`)
  const safe = pathname.startsWith('/') ? pathname : `/${pathname}`
  const bare = re.test(safe) ? safe.replace(re, '') : safe
  if (locale === DEFAULT_LOCALE) return bare || '/'
  return `/${locale}${bare === '/' ? '' : bare}`
}

/** Extract the locale from a pathname (defaults to DEFAULT_LOCALE) */
export function extractLocaleFromPath(pathname: string): Locale {
  const m = pathname.match(new RegExp(`^/(${languages.join('|')})(?:/|$)`))
  return normalizeLocale(m?.[1] || DEFAULT_LOCALE)
}

/** Client only: persist user choice for 1 year */
export function setLocaleCookie(locale: Locale) {
  if (typeof document === 'undefined') return
  const maxAge = 60 * 60 * 24 * 365
  document.cookie = `${LOCALE_COOKIE}=${locale}; Max-Age=${maxAge}; Path=/; SameSite=Lax`
}

/** Server utility: pick best from Accept-Language */
export function pickBestLocale(acceptLanguageHeader?: string | null): Locale {
  if (!acceptLanguageHeader) return DEFAULT_LOCALE
  try {
    const parts = acceptLanguageHeader
      .split(',')
      .map((s) => s.trim().split(';')[0].toLowerCase())
    for (const p of parts) {
      const n = normalizeLocale(p)
      if (isLocale(n)) return n
    }
  } catch {}
  return DEFAULT_LOCALE
}

/** BCP-47 tag (handy if you add RTL later) */
export function toLangTag(locale: Locale): string {
  return locale === 'fr' ? 'fr-FR' : 'en-US'
}
