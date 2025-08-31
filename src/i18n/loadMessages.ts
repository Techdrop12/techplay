// src/i18n/loadMessages.ts
// Chargement robuste + fallback (tree-shaking friendly)

import { normalizeLocale, type Locale } from '@/lib/language'

export type Messages = Record<string, unknown>

/**
 * Chargement des messages i18n avec mapping explicite (évite les context modules dynamiques).
 * Compatible RSC / Next 15 et sécurisé niveau bundling.
 */
export default async function loadMessages(localeInput: string | unknown): Promise<Messages> {
  const locale: Locale = normalizeLocale(
    typeof localeInput === 'string' ? localeInput : undefined
  )

  switch (locale) {
    case 'en': {
      const mod = await import('@/messages/en.json')
      return (mod.default ?? mod) as Messages
    }
    case 'fr':
    default: {
      const mod = await import('@/messages/fr.json')
      return (mod.default ?? mod) as Messages
    }
  }
}
