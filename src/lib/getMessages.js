import { getRequestConfig } from '@/i18n/request';

export default async function getMessages(locale) {
  const config = await getRequestConfig(locale);
  return config.messages;
}
