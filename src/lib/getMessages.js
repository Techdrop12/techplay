// ✅ src/lib/getMessages.js
import { createTranslator } from 'next-intl';
import { defaultLocale } from './i18n';
import messagesFr from '@/messages/fr.json';
import messagesEn from '@/messages/en.json';

const MESSAGES = {
  fr: messagesFr,
  en: messagesEn,
};

export async function getMessages(locale) {
  const messages = MESSAGES[locale] || MESSAGES[defaultLocale];
  const t = createTranslator({ locale, messages });
  return {
    ...messages,
    t,
  };
}
