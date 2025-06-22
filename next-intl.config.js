// ✅ next-intl.config.js

/**
 * Configuration i18n pour next-intl avec l'App Router :
 * - Liste des locales
 * - Locale par défaut
 * - TimeZone pour corriger ENVIRONMENT_FALLBACK
 */
module.exports = {
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed', // évite les doubles /fr/fr/
  timeZone: 'Europe/Paris',
};
