// src/lib/i18n-routing.ts
'use client'

// ✅ Source de vérité : locales depuis i18n/config
import { locales as SUPPORTED_LOCALES, defaultLocale as DEFAULT_LOCALE } from '@/i18n/config'
export type { Locale } from '@/i18n/config'

// ⬅️ On ré-exporte pour simplifier les imports dans les composants
export { SUPPORTED_LOCALES, DEFAULT_LOCALE }

const isSupported = (v?: string): v is typeof SUPPORTED_LOCALES[number] =>
  !!v && (SUPPORTED_LOCALES as readonly string[]).includes(v as string)

const ensureLeadingSlash = (p: string) => (p?.startsWith('/') ? p : `/${p || ''}`)

export function getCurrentPathname(): string {
  if (typeof window === 'undefined') return '/'
  try {
    return window.location.pathname || '/'
  } catch {
    return '/'
  }
}

export function getCurrentLocale(pathname?: string): typeof SUPPORTED_LOCALES[number] {
  const p = pathname ?? getCurrentPathname()
  const first = p.split('/').filter(Boolean)[0]
  return isSupported(first) ? (first as any) : (DEFAULT_LOCALE as any)
}

export function stripLocalePrefix(pathname: string): string {
  const parts = ensureLeadingSlash(pathname).split('/').filter(Boolean)
  if (parts.length && isSupported(parts[0])) parts.shift()
  const bare = '/' + parts.join('/')
  return bare === '//' ? '/' : bare
}

type LocalizeOptions = { keepQuery?: boolean; currentPathname?: string }

/** Construit un chemin localisé. `fr` (default) = sans préfixe, autres locales = /<locale>/… */
export function localizePath(
  path: string,
  locale: typeof SUPPORTED_LOCALES[number],
  opts: LocalizeOptions = {}
): string {
  const base = ensureLeadingSlash(path || opts.currentPathname || getCurrentPathname())
  const bare = stripLocalePrefix(base)
  const withLocale = locale === DEFAULT_LOCALE ? bare : `/${locale}${bare === '/' ? '' : bare}`
  const qs = opts.keepQuery && typeof window !== 'undefined' ? window.location.search || '' : ''
  return withLocale + qs
}

export function altLocales(pathname?: string) {
  const p = pathname ?? getCurrentPathname()
  return (SUPPORTED_LOCALES as readonly string[]).map((l) => ({ locale: l, href: localizePath(p, l as any) }))
}
