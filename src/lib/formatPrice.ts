// src/lib/formatPrice.ts
// Moteur de formatage prix : robuste SSR/CSR, options avancées + cache Intl

export type PriceOptions = {
  /** Locale (ex: 'fr-FR', 'en-US'). Auto si non fourni. */
  locale?: string;
  /** Devise ISO 4217 (EUR/USD/GBP...). Auto depuis locale si possible. */
  currency?: string;
  /** Affichage compact (1 200 € → 1,2 k€) */
  compact?: boolean;
  /** Forcer un nombre de décimales mini/maxi */
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  /** Supprimer les .00/.00 inutiles selon la locale */
  stripZeros?: boolean;
};

const CURRENCY_FALLBACK_BY_LOCALE: Record<string, string> = {
  fr: 'EUR',
  'fr-fr': 'EUR',
  'fr-be': 'EUR',
  'fr-ca': 'CAD',
  /** Route `en` sans région : boutique EU (évite USD implicite / mismatch SSR). */
  en: 'EUR',
  'en-gb': 'EUR',
  'en-us': 'USD',
  'en-ca': 'CAD',
  'en-au': 'AUD',
  de: 'EUR',
  'de-de': 'EUR',
  es: 'EUR',
  it: 'EUR',
};

/** BCP-47 pour Intl à partir du segment de locale Next (ex. `useLocale()` → `fr` | `en`). */
export function intlLocaleForStoreRoute(routeLocale: string): string {
  const base = String(routeLocale || 'fr').split(/[-_]/)[0]?.toLowerCase() ?? 'fr';
  return base === 'en' ? 'en-GB' : 'fr-FR';
}

/** Options stables SSR/CSR pour les prix catalogue (EUR + locale issue de la route). */
export function storefrontPriceOpts(routeLocale: string): PriceOptions {
  return { locale: intlLocaleForStoreRoute(routeLocale), currency: 'EUR' };
}

function resolveLocale(input?: string): string {
  if (input) return input;
  // Ne pas lire `navigator` : le HTML SSR et le premier rendu client doivent coïncider.
  return 'fr-FR';
}

function resolveCurrency(locale: string, input?: string): string {
  if (input) return input;
  const key = locale.toLowerCase();
  return (
    CURRENCY_FALLBACK_BY_LOCALE[key] || CURRENCY_FALLBACK_BY_LOCALE[key.split('-')[0]] || 'EUR'
  );
}

// Cache des formateurs pour perf
const nfCache = new Map<string, Intl.NumberFormat>();
function getFormatter(
  locale: string,
  currency: string,
  opts: Omit<PriceOptions, 'locale' | 'currency' | 'stripZeros'>
) {
  const key = JSON.stringify({ l: locale, c: currency, o: opts });
  let nf = nfCache.get(key);
  if (!nf) {
    nf = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: opts.compact ? 'compact' : 'standard',
      minimumFractionDigits: opts.minimumFractionDigits ?? 2,
      maximumFractionDigits: opts.maximumFractionDigits ?? (opts.compact ? 1 : 2),
    });
    nfCache.set(key, nf);
  }
  return nf;
}

/** Format prix “full option”.
 *  - handle NaN/Inf → '—'
 *  - auto locale/devise si non fournies
 *  - compact, stripZeros… */
export function formatPrice(price: number, options: PriceOptions = {}): string {
  if (!Number.isFinite(price)) return '—';

  const locale = resolveLocale(options.locale);
  const currency = resolveCurrency(locale, options.currency);
  const nf = getFormatter(locale, currency, options);

  if (options.stripZeros) {
    // Reconstruit sans la fraction si elle est 0
    const parts = nf.formatToParts(price);
    const fraction = parts.find((p) => p.type === 'fraction')?.value ?? '';
    const shouldStrip = /^0+$/.test(fraction);
    const cleaned = shouldStrip
      ? parts.filter((p) => p.type !== 'decimal' && p.type !== 'fraction')
      : parts;
    return cleaned.map((p) => p.value).join('');
  }

  return nf.format(price);
}

/** Raccourci: format en EUR (utile pour appels simples) */
export const formatEUR = (n: number, locale?: string) =>
  formatPrice(n, { locale: locale ?? 'fr-FR', currency: 'EUR' });
