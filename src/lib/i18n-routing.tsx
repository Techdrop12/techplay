// src/lib/i18n-routing.tsx
// Helpers i18n universels (SSR/CSR-safe)
// FR = racine “/”, EN = préfixée “/en”, conservation query/hash sûre.

import {
  locales as SUPPORTED_LOCALES,
  defaultLocale as DEFAULT_LOCALE,
  type Locale,
} from '@/i18n/config'

export { SUPPORTED_LOCALES, DEFAULT_LOCALE }
export type { Locale }

const isSupported = (v?: string): v is (typeof SUPPORTED_LOCALES)[number] =>
  !!v && (SUPPORTED_LOCALES as readonly string[]).includes(v as string)

const ensureLeadingSlash = (p: string) => (p?.startsWith('/') ? p : `/${p || ''}`)

/** Parse un chemin RELATIF potentiellement avec ?query et #hash (sans origin) */
function splitUrl(input: string) {
  const raw = input || '/'
  try {
    const u = new URL(raw, 'http://x') // base factice
    return {
      pathname: ensureLeadingSlash(u.pathname || '/'),
      search: u.search || '',
      hash: u.hash || '',
    }
  } catch {
    // Fallback ultra tolérant
    const m = String(raw).match(/^([^?#]*)(\?[^#]*)?(#.*)?$/)
    return {
      pathname: ensureLeadingSlash(m?.[1] || '/'),
      search: m?.[2] || '',
      hash: m?.[3] || '',
    }
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

/** Locale courante (priorité URL, puis cookie NEXT_LOCALE, sinon défaut) */
export function getCurrentLocale(pathname?: string): (typeof SUPPORTED_LOCALES)[number] {
  const p = pathname ?? getCurrentPathname()
  const first = p.split('/').filter(Boolean)[0]
  if (isSupported(first)) return first as any

  try {
    const cookie = (typeof document !== 'undefined'
      ? document.cookie.split('; ').find((c) => c.startsWith('NEXT_LOCALE='))?.split('=')[1]
      : undefined) as string | undefined
    if (isSupported(cookie)) return cookie as any
  } catch {}

  return DEFAULT_LOCALE as any
}

/** Retire un éventuel préfixe de locale du pathname fourni (ne touche pas query/hash) */
export function stripLocalePrefix(pathname: string): string {
  const p = ensureLeadingSlash(pathname)
  const parts = p.split('/').filter(Boolean)
  if (parts.length && isSupported(parts[0])) parts.shift()
  const bare = '/' + parts.join('/')
  return bare === '//' ? '/' : bare
}

type LocalizeOptions = {
  /** Conserver la query de la page courante si le chemin n’en a pas */
  keepQuery?: boolean
  /** Conserver le hash de la page courante si le chemin n’en a pas */
  keepHash?: boolean
  /** Pathname de secours si `path` est vide */
  currentPathname?: string
  /** Force la query (?a=1…) */
  customQuery?: string // prime sur keepQuery ET sur la query présente dans `path`
  /** Force le hash (#id) */
  customHash?: string  // prime sur keepHash ET sur le hash présent dans `path`
}

/**
 * Construit un chemin localisé robuste.
 * - `fr` (locale par défaut) → pas de préfixe
 * - autres locales → `/<locale>/…`
 * - conserve intelligemment ?query et #hash
 */
export function localizePath(
  path: string,
  locale: (typeof SUPPORTED_LOCALES)[number],
  opts: LocalizeOptions = {}
): string {
  const basis = path || opts.currentPathname || getCurrentPathname()
  const { pathname: rawPath, search: rawSearch, hash: rawHash } = splitUrl(basis)

  const barePath = stripLocalePrefix(rawPath)
  const withLocale = locale === DEFAULT_LOCALE ? barePath : `/${locale}${barePath === '/' ? '' : barePath}`

  // Query finale (priorités : custom > path > keepQuery(window))
  let q = ''
  if (typeof opts.customQuery === 'string') {
    q = opts.customQuery.startsWith('?') || opts.customQuery === '' ? opts.customQuery : `?${opts.customQuery}`
  } else if (rawSearch) {
    q = rawSearch
  } else if (opts.keepQuery && typeof window !== 'undefined') {
    q = window.location.search || ''
  }

  // Hash final (priorités : custom > path > keepHash(window))
  let h = ''
  if (typeof opts.customHash === 'string') {
    h = opts.customHash.startsWith('#') || opts.customHash === '' ? opts.customHash : `#${opts.customHash}`
  } else if (rawHash) {
    h = rawHash
  } else if (opts.keepHash && typeof window !== 'undefined') {
    h = window.location.hash || ''
  }

  return withLocale + q + h
}

/** URLs alternatives (hreflang) pour un chemin donné (conserve query/hash) */
export function altLocales(fullPath?: string) {
  const input = fullPath ?? (typeof window !== 'undefined' ? (window.location.pathname + window.location.search + window.location.hash) : '/')
  return (SUPPORTED_LOCALES as readonly string[]).map((l) => ({
    locale: l,
    href: localizePath(input, l as any, { keepQuery: true, keepHash: true }),
  }))
}
