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
  Boolean(v && (SUPPORTED_LOCALES as readonly string[]).includes(v))

const ensureLeadingSlash = (p: string) => (p.startsWith('/') ? p : `/${p}`)

// Routes that live under app/[locale]/... — only these get a locale prefix. All others (e.g. /contact, /blog) are root-only.
const LOCALIZED_PATHNAMES: readonly string[] = ['/', '/products', '/wishlist']

function normalizePathname(p: string): string {
  const s = ensureLeadingSlash(p).replace(/\/$/, '') || '/'
  return s
}

function isLocalizedRoute(pathname: string): boolean {
  return (LOCALIZED_PATHNAMES as readonly string[]).includes(normalizePathname(pathname))
}

const isExternalUrl = (p: string) =>
  /^([a-z][a-z0-9+\-.]*:)?\/\//i.test(p) || p.startsWith('mailto:') || p.startsWith('tel:')

function parsePath(input: string): {
  pathname: string
  search: string
  hash: string
} {
  const value = String(input || '/')
  const match = value.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/)

  return {
    pathname: ensureLeadingSlash(match?.[1] || '/'),
    search: match?.[2] || '',
    hash: match?.[3] || '',
  }
}

function getCurrentSearch(): string {
  if (typeof window === 'undefined') return ''
  try {
    return window.location.search || ''
  } catch {
    return ''
  }
}

function getCurrentHash(): string {
  if (typeof window === 'undefined') return ''
  try {
    return window.location.hash || ''
  } catch {
    return ''
  }
}

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
      .find((cookie) => cookie.startsWith(`${name}=`))

    if (!raw) return undefined
    return decodeURIComponent(raw.split('=').slice(1).join('='))
  } catch {
    return undefined
  }
}

export function getCurrentLocale(pathname?: string): Locale {
  const p = pathname ?? getCurrentPathname()
  const first = p.split('/').filter(Boolean)[0]

  if (isSupported(first)) return first

  const fromCookie = readCookie(LOCALE_COOKIE)
  if (isSupported(fromCookie)) return fromCookie

  return DEFAULT_LOCALE
}

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

export function localizePath(
  path: string,
  locale: Locale,
  opts: LocalizeOptions = {}
): string {
  const input = path || opts.currentPathname || getCurrentPathname()
  if (isExternalUrl(input) || input.startsWith('#')) return input

  const parsed = parsePath(input)
  const stripped = stripLocalePrefix(parsed.pathname)

  const search =
    opts.customQuery ?? (parsed.search || (opts.keepQuery ? getCurrentSearch() : ''))

  const hash =
    opts.customHash ?? (parsed.hash || (opts.keepHash ? getCurrentHash() : ''))

  const localizedPathname = isLocalizedRoute(stripped)
    ? _withLocale(stripped, locale)
    : stripped

  return `${localizedPathname}${search}${hash}`
}

export function altLocales(pathname?: string) {
  const p = pathname ?? getCurrentPathname()

  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
    href: localizePath(p, locale, { keepQuery: true, keepHash: true }),
  }))
}