// ✅ next-intl.config.js – Full Option i18n (aligné avec middleware)
export default {
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
  // On laisse la détection côté middleware (cookie/Accept-Language)
  localeDetection: false,
  domains: [
    { domain: 'techplay.fr', defaultLocale: 'fr' },
    { domain: 'en.techplay.fr', defaultLocale: 'en' }
  ]
}
