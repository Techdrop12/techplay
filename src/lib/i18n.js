// ✅ src/lib/i18n.js

const intlConfig = require('./next-intl.config.js'); // Corrigé : chemin local et require()

export const { locales, defaultLocale, timeZone } = intlConfig;

export { default as getRequestConfig } from '@/i18n/request';
