// src/lib/i18n-routing.tsx
// Helpers i18n universels (SSR/CSR-safe), URL prefix default-less (fr = /, en = /en)

import {
  languages as SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type Locale,
  isLocale,
  stripLocalePrefix as _strip,
  withLocale as _withLocale,
} from '@/lib/language'

export { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE }
export type { Locale }

const isSupported = (v?: string): v is (typeof SUPPORTED_LOCALES)[number] =>
  !!v && (SUPPORTED_LOCALES as readonly string[]).includes(v as string)

const ensureLeadingSlash = (p: string) => (p?.startsWith('/') ? p : `/${p || ''}`)
const isExternalUrl = (p: string) => /^([a-z][a-z0-9+\-.]*:)?\/\//i.test(p) || p.startsWith('mailto:') || p.startsWith('tel:')

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
    const raw = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))
    if (!raw) return undefined
    const v = raw.split('=').slice(1).join('=')
    return decodeURIComponent(v)
  } catch {
    return undefined
  }
}

/**
 * Locale courante (priorité URL, puis cookie LOCALE_COOKIE, sinon défaut)
 */
export function getCurrentLocale(pathname?: string): (typeof SUPPORTED_LOCALES)[number] {
  const p = pathname ?? getCurrentPathname()
  const first = p.split('/').filter(Boolean)[0]
  if (isSupported(first)) return first as any

  const fromCookie = readCookie(LOCALE_COOKIE)
  if (isSupported(fromCookie)) return fromCookie as any

  return DEFAULT_LOCALE as any
}

/** Retire un éventuel préfixe de locale du pathname fourni */
export function stripLocalePrefix(pathname: string): string {
  return _strip(pathname)
}

type LocalizeOptions = {
  keepQuery?: boolean
  keepHash?: boolean
  currentPathname?: string
  customQuery?: string // si fourni, prime sur keepQuery
  customHash?: string  // si fourni, prime sur keepHash
}

/**
 * Construit un chemin localisé.
 * - `fr` (locale par défaut) → pas de préfixe
 * - Autres locales → `/<locale>/…`
 * - Laisse intacts les liens externes (http, https, mailto, tel)
 */
export function localizePath(
  path: string,
  locale: (typeof SUPPORTED_LOCALES)[number],
  opts: LocalizeOptions = {}
): string {
  if (!path) path = opts.currentPathname || ''
  if (isExternalUrl(path)) return path

  const base = ensureLeadingSlash(path || opts.currentPathname || getCurrentPathname())
  const bare = stripLocalePrefix(base)
  const withLocale = _withLocale(bare, locale as Locale)

  const query =
    opts.customQuery ??
    (opts.keepQuery && typeof window !== 'undefined' ? window.location.search || '' : '')

  const hash =
    opts.customHash ??
    (opts.keepHash && typeof window !== 'undefined' ? window.location.hash || '' : '')

  return withLocale + query + hash
}

/** URLs alternatives (hreflang) pour un pathname donné */
export function altLocales(pathname?: string) {
  const p = pathname ?? getCurrentPathname()
  return (SUPPORTED_LOCALES as readonly string[]).map((l) => ({
    locale: l,
    href: localizePath(p, l as any, { keepQuery: true, keepHash: true }),
  }))
}
