// ✅ next-intl.config.js – Full Option i18n
export default {
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
  domains: [
    {
      domain: 'techplay.fr',
      defaultLocale: 'fr'
    },
    {
      domain: 'en.techplay.fr',
      defaultLocale: 'en'
    }
  ]
}
