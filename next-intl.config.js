export default {
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed', // ✅ Pas de /fr sur la home
  domains: [
    {
      domain: 'techplay.fr',
      defaultLocale: 'fr',
    },
    {
      domain: 'en.techplay.fr',
      defaultLocale: 'en',
    },
  ],
};
