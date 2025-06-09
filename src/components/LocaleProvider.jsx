// src/components/LocaleProvider.jsx
'use client';

import { NextIntlClientProvider } from 'next-intl';

export default function LocaleProvider({ locale, messages, children }) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      defaultTimeZone="Europe/Paris"
    >
      {children}
    </NextIntlClientProvider>
  );
}
