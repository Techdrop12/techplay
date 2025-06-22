// ✅ src/lib/i18n.js (corrigé)

import intlConfig from '../../next-intl.config.js';

export const { locales, defaultLocale, timeZone } = intlConfig;

export { default as getRequestConfig } from '@/i18n/request';
