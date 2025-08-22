// src/i18n/loadMessages.ts
import type { Locale } from './config';

export type Messages = Record<string, unknown>;

/**
 * Chargement des messages i18n avec mapping explicite (évite les context modules dynamiques).
 * Compatible RSC / Next 15 et sécurisé niveau bundling.
 */
export default async function loadMessages(locale: string): Promise<Messages> {
  const l: Locale = (locale === 'en' || locale === 'fr') ? (locale as Locale) : 'fr';

  switch (l) {
    case 'en': {
      const mod = await import('@/messages/en.json');
      return (mod.default ?? mod) as Messages;
    }
    case 'fr':
    default: {
      const mod = await import('@/messages/fr.json');
      return (mod.default ?? mod) as Messages;
    }
  }
}
