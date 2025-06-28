// ✅ /src/i18n/loadMessages.ts (chargement messages pour next-intl/app)
export default async function loadMessages(locale: string) {
  try {
    const messages = (await import(`../../messages/${locale}.json`)).default;
    return messages;
  } catch (e) {
    return {};
  }
}
