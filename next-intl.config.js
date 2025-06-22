// ✅ next-intl.config.js

/** 
 * Configuration next-intl pour App Router :
 * - locales disponibles
 * - locale par défaut
 * - fuseau horaire
 */
const intlConfig = {
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  timeZone: 'Europe/Paris',
};

module.exports = intlConfig;
