// src/lib/language.ts
// Source unique de vérité i18n — SSR/CSR safe

export const languages = ['fr', 'en'] as const;
export type Locale = (typeof languages)[number];
export type AppLocale = Locale;
export type OgLocale = 'fr_FR' | 'en_US';

export const DEFAULT_LOCALE: Locale = 'fr';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const localeLabels: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
};

const LANG_TAG: Record<Locale, string> = {
  fr: 'fr-FR',
  en: 'en-US',
};

const OG_LOCALE: Record<Locale, OgLocale> = {
  fr: 'fr_FR',
  en: 'en_US',
};

const LOCALE_SET = new Set<string>(languages);
const RE_LOCALE_PREFIX = new RegExp(`^/(?:${languages.join('|')})(?=/|$)`);

function ensureLeadingSlash(path: string): string {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function splitPathParts(input: string): {
  pathname: string;
  search: string;
  hash: string;
} {
  const value = String(input || '/');
  const match = value.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);

  return {
    pathname: ensureLeadingSlash(match?.[1] || '/'),
    search: match?.[2] || '',
    hash: match?.[3] || '',
  };
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && LOCALE_SET.has(value);
}

export function normalizeLocale(value: unknown): Locale {
  if (isLocale(value)) return value;

  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    if (lower.startsWith('fr')) return 'fr';
    if (lower.startsWith('en')) return 'en';
  }

  return DEFAULT_LOCALE;
}

export function toLangTag(locale: Locale): string {
  return LANG_TAG[locale];
}

export function toOgLocale(locale: Locale): OgLocale {
  return OG_LOCALE[locale];
}

export function stripLocalePrefix(path: string): string {
  const { pathname, search, hash } = splitPathParts(path);
  const stripped = pathname.replace(RE_LOCALE_PREFIX, '') || '/';
  return `${stripped}${search}${hash}`;
}

export function withLocale(path: string, locale: Locale): string {
  const stripped = stripLocalePrefix(path);
  const { pathname, search, hash } = splitPathParts(stripped);

  if (locale === DEFAULT_LOCALE) {
    return `${pathname}${search}${hash}`;
  }

  return `/${locale}${pathname === '/' ? '' : pathname}${search}${hash}`;
}

export function extractLocaleFromPath(path: string): Locale {
  const { pathname } = splitPathParts(path);
  const match = pathname.match(new RegExp(`^/(${languages.join('|')})(?=/|$)`));
  return normalizeLocale(match?.[1] || DEFAULT_LOCALE);
}

export function setLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return;

  const maxAge = 60 * 60 * 24 * 365;
  const secure =
    typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

export function pickBestLocale(acceptLanguageHeader?: string | null): Locale {
  if (!acceptLanguageHeader) return DEFAULT_LOCALE;

  try {
    const parsed = acceptLanguageHeader
      .split(',')
      .map((part) => {
        const [lang, qValue] = part.trim().split(';q=');
        return {
          lang: lang?.trim().toLowerCase() || '',
          q: qValue ? Number(qValue) : 1,
        };
      })
      .filter((entry) => entry.lang)
      .sort((a, b) => b.q - a.q);

    for (const entry of parsed) {
      if (entry.lang.startsWith('fr')) return 'fr';
      if (entry.lang.startsWith('en')) return 'en';
    }
  } catch {
    // no-op
  }

  return DEFAULT_LOCALE;
}
