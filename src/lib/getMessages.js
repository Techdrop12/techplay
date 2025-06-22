// ✅ src/lib/getMessages.js

import { getRequestConfig } from '@/lib/i18n';

export async function getMessages(locale) {
  const config = await getRequestConfig(locale);
  return config.messages;
}
