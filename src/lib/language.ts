export const languages = ['fr', 'en'] as const
export type Locale = (typeof languages)[number]
export const DEFAULT_LOCALE: Locale = 'fr'

export function isLocale(x: string | null | undefined): x is Locale {
  return !!x && (languages as readonly string[]).includes(x)
}
export function normalizeLocale(x: string | null | undefined): Locale {
  return isLocale(x) ? x : DEFAULT_LOCALE
}
export const localeLabels: Record<Locale, string> = { fr: 'Français', en: 'English' }
