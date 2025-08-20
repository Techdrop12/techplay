import { defaultLocale, type Locale, isLocale } from './config';

export type Messages = Record<string, unknown>;

export default async function loadMessages(locale: string): Promise<Messages> {
  const loc: Locale = isLocale(locale) ? (locale as any) : defaultLocale;

  try {
    // Next/TS sait importer les JSON dynamiques
    const mod = (await import(`../../messages/${loc}.json`)) as { default: Messages };
    return mod.default;
  } catch {
    if (loc !== defaultLocale) {
      try {
        const fallback = (await import(`../../messages/${defaultLocale}.json`)) as { default: Messages };
        return fallback.default;
      } catch {
        // aucun fichier dispo
        return {};
      }
    }
    return {};
  }
}
