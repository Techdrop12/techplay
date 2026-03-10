// src/lib/i18n-routing.tsx
// Helpers i18n universels (SSR/CSR-safe), URL prefix default-less (fr = /, en = /en)

import {
  languages as SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  stripLocalePrefix as _strip,
  withLocale as _withLocale,
} from '@/lib/language'

export { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE }
export type Locale = (typeof SUPPORTED_LOCALES)[number]

const isSupported = (v?: string): v is Locale =>
  !!v && (SUPPORTED_LOCALES as readonly string[]).includes(v)

const ensureLeadingSlash = (p: string) => (p.startsWith('/') ? p : `/${p}`)
const isExternalUrl = (p: string) =>
  /^([a-z][a-z0-9+\-.]*:)?\/\//i.test(p) || p.startsWith('mailto:') || p.startsWith('tel:')

export function getCurrentPathname(): string {
  if (typeof window === 'undefined') return '/'
  try {
    return window.location.pathname || '/'
  } catch {
    return '/'
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined

  try {
    const raw = document.cookie
      .split('; ')
      .find((c) => c.startsWith(`${name}=`))

    if (!raw) return undefined
    return decodeURIComponent(raw.split('=').slice(1).join('='))
  } catch {
    return undefined
  }
}

/**
 * Locale courante : URL > cookie > défaut
 */
export function getCurrentLocale(pathname?: string): Locale {
  const p = pathname ?? getCurrentPathname()
  const first = p.split('/').filter(Boolean)[0]

  if (isSupported(first)) return first

  const fromCookie = readCookie(LOCALE_COOKIE)
  if (isSupported(fromCookie)) return fromCookie

  return DEFAULT_LOCALE
}

/** Retire un éventuel préfixe de locale du pathname fourni */
export function stripLocalePrefix(pathname: string): string {
  return _strip(pathname)
}

type LocalizeOptions = {
  keepQuery?: boolean
  keepHash?: boolean
  currentPathname?: string
  customQuery?: string
  customHash?: string
}

/**
 * Construit un chemin localisé.
 * - fr (par défaut) => pas de préfixe
 * - autres => /<locale>/...
 * - laisse les liens externes intacts
 */
export function localizePath(
  path: string,
  locale: Locale,
  opts: LocalizeOptions = {}
): string {
  const input = path || opts.currentPathname || getCurrentPathname()
  if (isExternalUrl(input)) return input

  const base = ensureLeadingSlash(input)
  const bare = stripLocalePrefix(base)
  const localized = _withLocale(bare, locale)

  const query =
    opts.customQuery ??
    (opts.keepQuery && typeof window !== 'undefined' ? window.location.search || '' : '')

  const hash =
    opts.customHash ??
    (opts.keepHash && typeof window !== 'undefined' ? window.location.hash || '' : '')

  return `${localized}${query}${hash}`
}

/** URLs alternatives (hreflang) pour un pathname donné */
export function altLocales(pathname?: string) {
  const p = pathname ?? getCurrentPathname()

  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
    href: localizePath(p, locale, { keepQuery: true, keepHash: true }),
  }))
}