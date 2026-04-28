// src/lib/constants.ts
// ✅ Regroupe les constantes de marque, SEO et coordonnées pour un accès central.

export const BRAND = {
  NAME: process.env.NEXT_PUBLIC_SITE_NAME ?? 'TechPlay',
  /** URL sans slash final (canonical, OG, etc.) */
  URL: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.techplay.fr').replace(/\/+$/, ''),
  SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@techplay.fr',
  PHONE: process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? '+33 1 23 45 67 89',
  ADDRESS:
    process.env.NEXT_PUBLIC_COMPANY_ADDRESS ??
    'TechPlay, 10 rue de l’Innovation, 75000 Paris, France',
  LOCALE: process.env.NEXT_PUBLIC_LOCALE ?? 'fr-FR',
  CURRENCY: process.env.NEXT_PUBLIC_CURRENCY ?? 'EUR',
};

export const SEO_DEFAULTS = {
  TITLE: 'TechPlay',
  DESCRIPTION:
    'TechPlay : gadgets high-tech, innovations utiles et accessoires stylés. Livraison rapide, retours faciles, support premium.',
  OG_IMAGE: `${BRAND.URL}/og-default.jpg`,
  TWITTER: '@techplay',
};

export const LEGAL = {
  COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME ?? 'TechPlay SAS',
  VAT: process.env.NEXT_PUBLIC_VAT_NUMBER ?? 'FR00 123 456 789',
};

export const UI = {
  /** Seuil (€) au-delà duquel la livraison est gratuite. Une seule source. */
  FREE_SHIPPING_THRESHOLD: Number(
    process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? process.env.NEXT_PUBLIC_FREE_SHIPPING ?? 49
  ),
  /** Nombre max d’articles dans la liste d’envies. */
  FLAT_SHIPPING_FEE: Number(process.env.NEXT_PUBLIC_FLAT_SHIPPING_FEE ?? 4.9),
  TAX_RATE: Number(process.env.NEXT_PUBLIC_TAX_RATE ?? 0),
  WISHLIST_LIMIT: Number.parseInt(process.env.NEXT_PUBLIC_WISHLIST_LIMIT ?? '50', 10),
};

export const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? '@techplay';
