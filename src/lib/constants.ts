// src/lib/constants.ts
// ✅ Regroupe les constantes de marque, SEO et coordonnées pour un accès central.

export const BRAND = {
  NAME: process.env.NEXT_PUBLIC_SITE_NAME ?? "TechPlay",
  URL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://techplay.example.com",
  SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@techplay.example.com",
  PHONE: process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "+33 1 23 45 67 89",
  ADDRESS:
    process.env.NEXT_PUBLIC_COMPANY_ADDRESS ??
    "TechPlay, 10 rue de l’Innovation, 75000 Paris, France",
  LOCALE: process.env.NEXT_PUBLIC_LOCALE ?? "fr-FR",
  CURRENCY: process.env.NEXT_PUBLIC_CURRENCY ?? "EUR",
};

export const SEO_DEFAULTS = {
  TITLE: "TechPlay",
  DESCRIPTION:
    "TechPlay : gadgets high-tech, innovations utiles et accessoires stylés. Livraison rapide, retours faciles, support premium.",
  OG_IMAGE: `${BRAND.URL}/og-default.jpg`,
  TWITTER: "@techplay",
};

export const LEGAL = {
  COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME ?? "TechPlay SAS",
  VAT: process.env.NEXT_PUBLIC_VAT_NUMBER ?? "FR00 123 456 789",
};

export const UI = {
  FREE_SHIPPING_THRESHOLD: Number(process.env.NEXT_PUBLIC_FREE_SHIPPING ?? 49),
};
