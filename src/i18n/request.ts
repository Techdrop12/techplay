// src/i18n/request.ts

import type { IntlConfig } from 'next-intl';

export default async function getConfig({
  locale,
  defaultLocale,
}: {
  locale?: string;
  defaultLocale?: string;
}): Promise<IntlConfig> {
  // 1) On choisit la locale réelle à utiliser :
  //    - si le plugin a passé `locale`, on l’utilise,
  //    - sinon, si `defaultLocale` est défini, on l’utilise,
  //    - sinon, on tombe sur 'fr' (ou la locale de votre choix).
  const actualLocale = locale ?? defaultLocale ?? 'fr';

  // 2) On importe dynamiquement le JSON correspondant
  //    (ce fichier doit exister dans /messages/…
  //     par exemple messages/fr.json et messages/en.json).
  const messages = (await import(`../../messages/${actualLocale}.json`)).default;

  // 3) On retourne un objet conforme à IntlConfig :
  return {
    locale: actualLocale,
    messages,
  };
}
