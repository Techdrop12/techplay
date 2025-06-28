// ✅ /src/lib/i18n.js (gestion i18n universelle, compatibilité Next 15, next-intl)
import { NextIntlProvider } from 'next-intl';
import getMessages from './getMessages';

export async function getI18nProps(locale) {
  const messages = await getMessages(locale);
  return { locale, messages };
}

export function withI18n(Component) {
  return function Wrapper(props) {
    const { locale, messages } = props;
    return (
      <NextIntlProvider locale={locale} messages={messages}>
        <Component {...props} />
      </NextIntlProvider>
    );
  };
}
