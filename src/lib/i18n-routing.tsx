// src/lib/i18n-routing.tsx — FINAL (client-safe, cookie-aware, locales depuis i18n/config)
'use client'

import {
  locales as SUPPORTED_LOCALES,
  defaultLocale as DEFAULT_LOCALE
} from '@/i18n/config'
export type { Locale } from '@/i18n/config'

export { SUPPORTED_LOCALES, DEFAULT_LOCALE }

const isSupported = (v?: string): v is (typeof SUPPORTED_LOCALES)[number] =>
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

/**
 * Détermine la locale courante.
 * 1) /<locale>/… dans l’URL → prioritaire
 * 2) Cookie NEXT_LOCALE s’il est valide
 * 3) Locale par défaut
 */
export function getCurrentLocale(pathname?: string): (typeof SUPPORTED_LOCALES)[number] {
  const p = pathname ?? getCurrentPathname()
  const first = p.split('/').filter(Boolean)[0]
  if (isSupported(first)) return first as any

  try {
    const cookie = document.cookie
      .split('; ')
      .find((c) => c.startsWith('NEXT_LOCALE='))?.split('=')[1]
    if (isSupported(cookie)) return cookie as any
  } catch {}

  return DEFAULT_LOCALE as any
}

/** Retire un éventuel préfixe de locale du pathname fourni */
export function stripLocalePrefix(pathname: string): string {
  const parts = ensureLeadingSlash(pathname).split('/').filter(Boolean)
  if (parts.length && isSupported(parts[0])) parts.shift()
  const bare = '/' + parts.join('/')
  return bare === '//' ? '/' : bare
}

type LocalizeOptions = { keepQuery?: boolean; currentPathname?: string }

/**
 * Construit un chemin localisé.
 * - `fr` (locale par défaut) → pas de préfixe
 * - Autres locales → `/<locale>/…`
 */
export function localizePath(
  path: string,
  locale: (typeof SUPPORTED_LOCALES)[number],
  opts: LocalizeOptions = {}
): string {
  const base = ensureLeadingSlash(path || opts.currentPathname || getCurrentPathname())
  const bare = stripLocalePrefix(base)
  const withLocale = locale === DEFAULT_LOCALE ? bare : `/${locale}${bare === '/' ? '' : bare}`
  const qs = opts.keepQuery && typeof window !== 'undefined' ? window.location.search || '' : ''
  return withLocale + qs
}

/** URLs alternatives (hreflang) pour un pathname donné */
export function altLocales(pathname?: string) {
  const p = pathname ?? getCurrentPathname()
  return (SUPPORTED_LOCALES as readonly string[]).map((l) => ({
    locale: l,
    href: localizePath(p, l as any)
  }))
}
