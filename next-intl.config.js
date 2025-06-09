// next-intl.config.js

/**
 * Ceci configure next-intl pour l’App Router :
 *  - liste des locales
 *  - locale par défaut
 *  - timeZone pour lever ENVIRONMENT_FALLBACK
 */
module.exports = {
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  timeZone: 'Europe/Paris'
};
