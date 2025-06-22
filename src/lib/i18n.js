// ✅ src/lib/i18n.js — compatible avec module.exports (CommonJS)

const intlConfig = require('../../next-intl.config.js');

export const { locales, defaultLocale, timeZone } = intlConfig;

export { default as getRequestConfig } from '@/i18n/request';
