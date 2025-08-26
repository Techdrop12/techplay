// src/lib/i18n-routing.ts
'use client'

export const SUPPORTED_LOCALES = ['fr', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'fr'

const isSupported = (v?: string): v is Locale =>
  !!v && (SUPPORTED_LOCALES as readonly string[]).includes(v)

const ensureLeadingSlash = (p: string) => (p?.startsWith('/') ? p : `/${p || ''}`)

export function getCurrentPathname(): string {
  if (typeof window === 'undefined') return '/'
  try {
    return window.location.pathname || '/'
  } catch {
    return '/'
  }
}

export function getCurrentLocale(pathname?: string): Locale {
  const p = pathname ?? getCurrentPathname()
  const first = p.split('/').filter(Boolean)[0]
  return isSupported(first) ? (first as Locale) : DEFAULT_LOCALE
}

export function stripLocalePrefix(pathname: string): string {
  const parts = ensureLeadingSlash(pathname).split('/').filter(Boolean)
  if (parts.length && isSupported(parts[0])) parts.shift()
  const bare = '/' + parts.join('/')
  return bare === '//' ? '/' : bare
}

type LocalizeOptions = { keepQuery?: boolean; currentPathname?: string }

/** Construit un chemin localisé. `fr` = sans préfixe, autres locales = /<locale>/… */
export function localizePath(path: string, locale: Locale, opts: LocalizeOptions = {}): string {
  const base = ensureLeadingSlash(path || opts.currentPathname || getCurrentPathname())
  const bare = stripLocalePrefix(base)
  const withLocale = locale === DEFAULT_LOCALE ? bare : `/${locale}${bare === '/' ? '' : bare}`
  const qs =
    opts.keepQuery && typeof window !== 'undefined'
      ? window.location.search || ''
      : ''
  return withLocale + qs
}

export function altLocales(pathname?: string): { locale: Locale; href: string }[] {
  const p = pathname ?? getCurrentPathname()
  return SUPPORTED_LOCALES.map((l) => ({ locale: l, href: localizePath(p, l) }))
}
